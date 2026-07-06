using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.DTOs.Dashboard;
using StudentManagement.Application.Services;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        return await _context.Students
            .AsNoTracking()
            .GroupBy(_ => 1)
            .Select(group => new DashboardSummaryDto
            {
                TotalStudents = group.Count(),
                ActiveEnrollments = _context.Enrollments.Count(enrollment => enrollment.Status == "Active"),
                PendingPayments = _context.Payments.Count(payment => payment.Status == "Pending"),
                PendingServiceRequests = _context.StudentServices.Count(serviceRequest => serviceRequest.Status == "Pending"),
                ActiveRides = _context.RideBookings.Count(ride => ride.Status == "Active" || ride.Status == "Pending"),
                TotalRevenue = _context.Payments.Where(payment => payment.Status == "Paid").Sum(payment => (decimal?)payment.Amount) ?? 0m
            })
            .FirstAsync();
    }

    public async Task<IReadOnlyList<EnrollmentTrendDto>> GetEnrollmentTrendsAsync(DateRange range)
    {
        var (startDate, endDate) = ResolveDateRange(range);

        return await _context.Enrollments
            .AsNoTracking()
            .Where(enrollment => enrollment.EnrolledOn != null
                && enrollment.EnrolledOn >= startDate
                && enrollment.EnrolledOn < endDate.AddDays(1))
            .GroupBy(enrollment => enrollment.EnrolledOn!.Value.Date)
            .Select(group => new EnrollmentTrendDto
            {
                Date = group.Key,
                Enrollments = group.Count(),
                CompletedEnrollments = group.Count(enrollment => enrollment.Status == "Completed")
            })
            .OrderBy(row => row.Date)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<StudentApplicationDto>> GetRecentStudentApplicationsAsync(int limit)
    {
        limit = Math.Clamp(limit, 1, 100);

        return await _context.Enrollments
            .AsNoTracking()
            .Include(enrollment => enrollment.Student)
            .Include(enrollment => enrollment.Course)
            .OrderByDescending(enrollment => enrollment.EnrolledOn ?? DateTime.MinValue)
            .Select(enrollment => new StudentApplicationDto
            {
                StudentId = enrollment.StudentSsn,
                StudentName = string.Join(" ", new[] { enrollment.Student.FirstName, enrollment.Student.LastName }.Where(value => !string.IsNullOrWhiteSpace(value))),
                CourseId = enrollment.CourseId,
                CourseName = enrollment.Course.CourseName,
                AppliedOn = enrollment.EnrolledOn,
                Status = enrollment.Status
            })
            .Take(limit)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<ActivityLogDto>> GetRecentActivitiesAsync(int limit)
    {
        limit = Math.Clamp(limit, 1, 100);

        var enrollmentActivities = _context.Enrollments
            .AsNoTracking()
            .Include(enrollment => enrollment.Student)
            .Include(enrollment => enrollment.Course)
            .Select(enrollment => new ActivityLogDto
            {
                Title = $"{enrollment.Student.FirstName} {enrollment.Student.LastName} enrolled in {enrollment.Course.CourseName}",
                OccurredAt = enrollment.EnrolledOn ?? DateTime.MinValue,
                Tone = "info",
                Icon = "BookOpenCheck"
            });

        var paymentActivities = _context.Payments
            .AsNoTracking()
            .Include(payment => payment.Enrollment)
                .ThenInclude(enrollment => enrollment.Course)
            .Select(payment => new ActivityLogDto
            {
                Title = $"Payment #{payment.PaymentId} for {payment.Enrollment.Course.CourseName} marked {payment.Status}",
                OccurredAt = payment.PaymentDate ?? DateTime.MinValue,
                Tone = payment.Status == "Paid" ? "success" : payment.Status == "Failed" ? "danger" : "neutral",
                Icon = "BadgeDollarSign"
            });

        var serviceActivities = _context.StudentServices
            .AsNoTracking()
            .Include(studentService => studentService.Student)
            .Include(studentService => studentService.Service)
            .Select(studentService => new ActivityLogDto
            {
                Title = $"{studentService.Student.FirstName} {studentService.Student.LastName} requested {studentService.Service.ServiceName}",
                OccurredAt = studentService.RequestedDate ?? DateTime.MinValue,
                Tone = studentService.Status == "Approved" ? "success" : studentService.Status == "Rejected" ? "danger" : "info",
                Icon = "ClipboardList"
            });

        var rideActivities = _context.RideBookings
            .AsNoTracking()
            .Include(rideBooking => rideBooking.Student)
            .Include(rideBooking => rideBooking.Driver)
            .Select(rideBooking => new ActivityLogDto
            {
                Title = $"{rideBooking.Student.FirstName} {rideBooking.Student.LastName} booked a ride with {rideBooking.Driver.FirstName} {rideBooking.Driver.LastName}",
                OccurredAt = rideBooking.BookingDate ?? DateTime.MinValue,
                Tone = rideBooking.Status == "Completed" ? "success" : rideBooking.Status == "Cancelled" ? "danger" : "neutral",
                Icon = "BusFront"
            });

        return await enrollmentActivities
            .Concat(paymentActivities)
            .Concat(serviceActivities)
            .Concat(rideActivities)
            .OrderByDescending(activity => activity.OccurredAt)
            .Take(limit)
            .ToListAsync();
    }

    private static (DateTime startDate, DateTime endDate) ResolveDateRange(DateRange range)
    {
        var today = DateTime.UtcNow.Date;

        if (range.From.HasValue || range.To.HasValue)
        {
            var start = (range.From ?? DateOnly.FromDateTime(today.AddDays(-(Math.Max(range.Days, 1) - 1)))).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var end = (range.To ?? DateOnly.FromDateTime(today)).ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);
            return (start, end);
        }

        var days = Math.Max(range.Days, 1);
        return (today.AddDays(-(days - 1)), today);
    }
}