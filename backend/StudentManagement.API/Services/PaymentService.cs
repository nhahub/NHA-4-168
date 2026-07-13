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

    public async Task<IEnumerable<PaymentDto>> GetAllAsync()
    {
        return await _context.Payments
           .Include(p => p.Enrollment)
    .ThenInclude(e => e.Student)
.Include(p => p.Enrollment)
    .ThenInclude(e => e.Course)
            .Select(p => new PaymentDto
            {
                PaymentId = p.PaymentId,
                EnrollmentId = p.EnrollmentId,

                Amount = p.Amount,
                PaymentDate = p.PaymentDate,

                PaymentMethod = p.PaymentMethod,
                Status = p.Status,
                TransactionId = p.TransactionId,

                StudentName = p.Enrollment.Student.FirstName + " " + p.Enrollment.Student.LastName,
                CourseName = p.Enrollment.Course.CourseName,
                CourseId = p.Enrollment.Course.CourseId
            })
            .ToListAsync();
    }

    public async Task<PaymentDto?> GetByIdAsync(int id)
    {
        return await _context.Payments
     .Include(p => p.Enrollment)
         .ThenInclude(e => e.Student)
     .Include(p => p.Enrollment)
         .ThenInclude(e => e.Course)
     .Where(p => p.PaymentId == id)
     .Select(p => new PaymentDto
     {
         PaymentId = p.PaymentId,
         EnrollmentId = p.EnrollmentId,

         Amount = p.Amount,
         PaymentDate = p.PaymentDate,

         PaymentMethod = p.PaymentMethod,
         Status = p.Status,
         TransactionId = p.TransactionId,

         StudentName = p.Enrollment.Student.FirstName + " " + p.Enrollment.Student.LastName,
         CourseName = p.Enrollment.Course.CourseName,
         CourseId = p.Enrollment.Course.CourseId
     })
     .FirstOrDefaultAsync();
    }

    public async Task<PaymentDto> CreateAsync(CreatePaymentDto dto)
    {
        var enrollment = await _context.Enrollments
            .Include(e => e.Course)
            .Include(e => e.Student)
            .FirstOrDefaultAsync(e => e.EnrollmentId == dto.EnrollmentId);

        if (enrollment == null)
            throw new Exception("Enrollment not found.");

        var exists = await _context.Payments
            .AnyAsync(p => p.EnrollmentId == dto.EnrollmentId);

        if (exists)
            throw new Exception("Payment already exists.");

        var payment = new Payment
        {
            EnrollmentId = dto.EnrollmentId,
            Amount = enrollment.Course?.Fee ?? 0,
            PaymentDate = DateTime.UtcNow,
            Status = "Pending",
            PaymentMethod = dto.PaymentMethod
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return new PaymentDto
        {
            PaymentId = payment.PaymentId,
            EnrollmentId = payment.EnrollmentId,

            Amount = payment.Amount,
            PaymentDate = payment.PaymentDate,

            PaymentMethod = payment.PaymentMethod,
            Status = payment.Status,
            TransactionId = payment.TransactionId,

            StudentName = enrollment.Student.FirstName + " " + enrollment.Student.LastName,
            CourseName = enrollment.Course.CourseName,
            CourseId = enrollment.Course.CourseId
        };
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
        return await _context.Payments
            .Include(p => p.Enrollment)
                .ThenInclude(e => e.Student)
            .Include(p => p.Enrollment)
                .ThenInclude(e => e.Course)
            .Where(p => p.Enrollment.Student.StudentSsn == studentSsn)
            .Select(p => new PaymentDto
            {
                PaymentId = p.PaymentId,
                EnrollmentId = p.EnrollmentId,

                Amount = p.Amount,
                PaymentDate = p.PaymentDate,

                PaymentMethod = p.PaymentMethod,
                Status = p.Status,
                TransactionId = p.TransactionId,

                StudentName = p.Enrollment.Student.FirstName + " " + p.Enrollment.Student.LastName,
                CourseName = p.Enrollment.Course.CourseName,
                CourseId = p.Enrollment.Course.CourseId
            })
            .ToListAsync();
    }

    public async Task<PaymentDto?> GetByEnrollmentAsync(int enrollmentId)
    {
        return await _context.Payments
            .Include(p => p.Enrollment)
                .ThenInclude(e => e.Student)
            .Include(p => p.Enrollment)
                .ThenInclude(e => e.Course)
            .Where(p => p.EnrollmentId == enrollmentId)
            .Select(p => new PaymentDto
            {
                PaymentId = p.PaymentId,
                EnrollmentId = p.EnrollmentId,

                Amount = p.Amount,
                PaymentDate = p.PaymentDate,

                PaymentMethod = p.PaymentMethod,
                Status = p.Status,
                TransactionId = p.TransactionId,

                StudentName = p.Enrollment.Student.FirstName + " " + p.Enrollment.Student.LastName,
                CourseName = p.Enrollment.Course.CourseName,
                CourseId = p.Enrollment.Course.CourseId
            })
            .FirstOrDefaultAsync();
    }
}