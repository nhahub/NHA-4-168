using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.DTOs.Payment;
using StudentManagement.Infrastructure.Data;
using StudentManagement.Domain.Entities;

namespace StudentManagement.API.Services;

public class PaymentService
{
    private readonly AppDbContext _context;

    public PaymentService(AppDbContext context)
    {
        _context = context;
    }

    private static PaymentDto MapToDto(Payment p)
    {
        var isTrip = p.TripId.HasValue;

        string studentName;
        if (isTrip)
        {
            studentName = p.Student != null ? $"{p.Student.FirstName} {p.Student.LastName}" : string.Empty;
        }
        else
        {
            studentName = p.Enrollment?.Student != null
                ? $"{p.Enrollment.Student.FirstName} {p.Enrollment.Student.LastName}"
                : string.Empty;
        }

        return new PaymentDto
        {
            PaymentId = p.PaymentId,
            EnrollmentId = p.EnrollmentId,
            TripId = p.TripId,

            Amount = p.Amount,
            PaymentDate = p.PaymentDate,

            PaymentMethod = p.PaymentMethod,
            Status = p.Status,
            TransactionId = p.TransactionId,

            StudentName = studentName,

            CourseName = p.Enrollment?.Course?.CourseName,
            CourseId = p.Enrollment?.Course?.CourseId,

            TripDestination = p.Trip?.Destination,
            TripPickupArea = p.Trip?.PickupArea,

            PaymentType = isTrip ? "Trip" : "Course"
        };
    }

    private IQueryable<Payment> PaymentsWithDetails()
    {
        return _context.Payments
            .Include(p => p.Enrollment).ThenInclude(e => e!.Student)
            .Include(p => p.Enrollment).ThenInclude(e => e!.Course)
            .Include(p => p.Trip)
            .Include(p => p.Student);
    }

    public async Task<IEnumerable<PaymentDto>> GetAllAsync()
    {
        var payments = await PaymentsWithDetails().ToListAsync();
        return payments.Select(MapToDto);
    }

    public async Task<PaymentDto?> GetByIdAsync(int id)
    {
        var payment = await PaymentsWithDetails().FirstOrDefaultAsync(p => p.PaymentId == id);
        return payment == null ? null : MapToDto(payment);
    }

    public async Task<PaymentDto> CreateAsync(CreatePaymentDto dto)
    {
        if (dto.EnrollmentId.HasValue)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.Course)
                .Include(e => e.Student)
                .FirstOrDefaultAsync(e => e.EnrollmentId == dto.EnrollmentId.Value);

            if (enrollment == null)
                throw new Exception("Enrollment not found.");

            var exists = await _context.Payments.AnyAsync(p => p.EnrollmentId == dto.EnrollmentId.Value);
            if (exists)
                throw new Exception("Payment already exists.");

            var payment = new Payment
            {
                EnrollmentId = dto.EnrollmentId.Value,
                Amount = enrollment.Course?.Fee ?? dto.Amount,
                PaymentDate = DateTime.UtcNow,
                Status = "Pending",
                PaymentMethod = dto.PaymentMethod
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            payment.Enrollment = enrollment;
            return MapToDto(payment);
        }

        if (dto.TripId.HasValue && dto.StudentSsn.HasValue)
        {
            return await CreatePaymentForTripAsync(dto.TripId.Value, dto.StudentSsn.Value, dto.Amount, dto.PaymentMethod);
        }

        throw new Exception("Either EnrollmentId, or both TripId and StudentSsn, must be provided.");
    }

    /// <summary>
    /// Creates the Payment record for a student booking a Trip. Called right after
    /// a student is added to a trip, mirroring how enrollment payments are created
    /// right after a course enrollment.
    /// </summary>
    public async Task<PaymentDto> CreatePaymentForTripAsync(int tripId, long studentSsn, decimal amount, string? paymentMethod = null)
    {
        var trip = await _context.Trips.FirstOrDefaultAsync(t => t.TripId == tripId)
            ?? throw new Exception("Trip not found.");

        var student = await _context.Students.FirstOrDefaultAsync(s => s.StudentSsn == studentSsn)
            ?? throw new Exception("Student not found.");

        var payment = new Payment
        {
            TripId = tripId,
            StudentSsn = studentSsn,
            Amount = amount,
            PaymentDate = DateTime.UtcNow,
            Status = "Pending",
            PaymentMethod = paymentMethod
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        payment.Trip = trip;
        payment.Student = student;
        return MapToDto(payment);
    }

    public async Task<bool> UpdateStatusAsync(int id, UpdatePaymentStatusDto dto)
    {
        var payment = await _context.Payments.FindAsync(id);

        if (payment == null)
            return false;

        payment.Status = dto.Status;

        if (string.IsNullOrEmpty(payment.TransactionId))
        {
            payment.TransactionId = Guid.NewGuid().ToString();
        }

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<PaymentDto>> GetStudentPaymentsAsync(long studentSsn)
    {
        var payments = await PaymentsWithDetails()
            .Where(p => (p.Enrollment != null && p.Enrollment.Student.StudentSsn == studentSsn)
                     || (p.TripId != null && p.StudentSsn == studentSsn))
            .ToListAsync();

        return payments.Select(MapToDto);
    }

    public async Task<PaymentDto?> GetByEnrollmentAsync(int enrollmentId)
    {
        var payment = await PaymentsWithDetails().FirstOrDefaultAsync(p => p.EnrollmentId == enrollmentId);
        return payment == null ? null : MapToDto(payment);
    }

    public async Task<PaymentDto?> GetByTripAndStudentAsync(int tripId, long studentSsn)
    {
        var payment = await PaymentsWithDetails()
            .FirstOrDefaultAsync(p => p.TripId == tripId && p.StudentSsn == studentSsn);
        return payment == null ? null : MapToDto(payment);
    }
}
