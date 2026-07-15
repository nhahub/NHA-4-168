using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.DTOs.Dashboard;
using StudentManagement.Application.Services;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    // Share of each course payment that belongs to the admin as revenue.
    // The remaining (1 - CourseAdminRevenueRate) is the instructor's earnings.
    private const decimal CourseAdminRevenueRate = 0.10m;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        // Course enrollment payments aren't split here; only the admin's share
        // (CourseAdminRevenueRate) counts as revenue. The rest is the instructor's earnings.
        var paymentsRevenue = (await _context.Payments
            .Where(payment => payment.Status == "Paid")
            .SumAsync(payment => (decimal?)payment.Amount) ?? 0m) * CourseAdminRevenueRate;

        // Trip bookings aren't recorded as Payments (they're not tied to an Enrollment),
        // so we add their revenue here: every row in TripStudents represents one booked
        // seat, charged at that trip's price. Only the admin's share (CourseAdminRevenueRate)
        // counts as revenue; the rest is the driver's earnings.
        var tripsRevenue = await _context.TripStudents
            .SumAsync(tripStudent => (decimal?)tripStudent.Trip.Price * CourseAdminRevenueRate) ?? 0m;

        return await _context.Students
            .AsNoTracking()
            .GroupBy(_ => 1)
            .Select(group => new DashboardSummaryDto
            {
                TotalStudents = group.Count(),
                ActiveEnrollments = _context.Enrollments.Count(enrollment => enrollment.Status == "Active"),
                PendingPayments = _context.Payments.Count(payment => payment.Status == "Pending"),
                PendingServiceRequests = _context.StudentServices.Count(serviceRequest => serviceRequest.Status == "Pending"),
                ActiveRides = _context.Trips.Count(ride => ride.Status == "Active" || ride.Status == "Pending"),
                TotalRevenue = paymentsRevenue + tripsRevenue
            })
            .FirstAsync();
    }

    public async Task<IReadOnlyList<EnrollmentTrendDto>> GetEnrollmentTrendsAsync(DateRange range)
    {
        var (startDate, endDate) = ResolveDateRange(range);

        var dailyCounts = await _context.Enrollments
            .AsNoTracking()
            .Where(enrollment => enrollment.EnrolledOn != null
                && enrollment.EnrolledOn >= startDate
                && enrollment.EnrolledOn < endDate.AddDays(1))
            .GroupBy(enrollment => enrollment.EnrolledOn!.Value.Date)
            .Select(group => new
            {
                Date = group.Key,
                Enrollments = group.Count(),
                CompletedEnrollments = group.Count(enrollment => enrollment.Status == "Completed")
            })
            .ToDictionaryAsync(group => group.Date, group => group);

        // Build a continuous, zero-filled series so every day in the range is
        // represented even when there were no enrollments.
        var result = new List<EnrollmentTrendDto>();
        for (var day = startDate.Date; day <= endDate.Date; day = day.AddDays(1))
        {
            dailyCounts.TryGetValue(day, out var entry);
            result.Add(new EnrollmentTrendDto
            {
                Date = day,
                Enrollments = entry?.Enrollments ?? 0,
                CompletedEnrollments = entry?.CompletedEnrollments ?? 0
            });
        }

        return result;
    }

    public async Task<IReadOnlyList<StudentApplicationDto>> GetRecentStudentApplicationsAsync(int limit)
    {
        var maxLimit = limit <= 0 ? int.MaxValue : limit;

        var recentApplications = await _context.Enrollments
            .AsNoTracking()
            .OrderByDescending(enrollment => enrollment.EnrolledOn ?? DateTime.MinValue)
            .Select(enrollment => new
            {
                enrollment.StudentSsn,
                enrollment.Student.FirstName,
                enrollment.Student.LastName,
                enrollment.CourseId,
                enrollment.Course.CourseName,
                enrollment.EnrolledOn,
                enrollment.Status
            })
            .Take(maxLimit)
            .ToListAsync();

        return recentApplications
            .Select(enrollment => new StudentApplicationDto
            {
                StudentId = enrollment.StudentSsn,
                StudentName = $"{enrollment.FirstName} {enrollment.LastName}".Trim(),
                StudentSsn = enrollment.StudentSsn,
                CourseId = enrollment.CourseId,
                CourseName = enrollment.CourseName,
                AppliedOn = enrollment.EnrolledOn,
                Status = enrollment.Status
            })
            .ToList();
    }

    public async Task<IReadOnlyList<ActivityLogDto>> GetRecentActivitiesAsync(int limit)
    {
        var maxLimit = limit <= 0 ? int.MaxValue : limit;

        var enrollmentActivities = await _context.Enrollments
            .AsNoTracking()
            .OrderByDescending(e => e.EnrolledOn ?? DateTime.MinValue)
            .Select(e => new
            {
                e.Student.FirstName,
                e.Student.LastName,
                e.Course.CourseName,
                OccurredAt = e.EnrolledOn ?? DateTime.MinValue
            })
            .ToListAsync();

        var paymentActivities = await _context.Payments
            .AsNoTracking()
            .OrderByDescending(p => p.PaymentDate ?? DateTime.MinValue)
            .Select(p => new
            {
                p.PaymentId,
                p.Enrollment.Course.CourseName,
                p.Status,
                OccurredAt = p.PaymentDate ?? DateTime.MinValue
            })
            .ToListAsync();

        var serviceActivities = await _context.StudentServices
            .AsNoTracking()
            .OrderByDescending(ss => ss.RequestedDate ?? DateTime.MinValue)
            .Select(ss => new
            {
                ss.Student.FirstName,
                ss.Student.LastName,
                ss.Service.ServiceName,
                ss.Status,
                OccurredAt = ss.RequestedDate ?? DateTime.MinValue
            })
            .ToListAsync();

        var rideActivities = await _context.TripStudents
            .AsNoTracking()
            .OrderByDescending(ts => ts.JoinedAt)
            .Select(ts => new
            {
                ts.Student.FirstName,
                ts.Student.LastName,
                DriverFirstName = ts.Trip.Driver.FirstName,
                DriverLastName = ts.Trip.Driver.LastName,
                OccurredAt = ts.JoinedAt,
                Status = ts.Trip.Status
            })
            .ToListAsync();

        string BuildFullName(string firstName, string lastName)
        {
            return $"{firstName} {lastName}".Trim();
        }

        return enrollmentActivities
            .Select(activity => new ActivityLogDto
            {
                Title = BuildFullName(activity.FirstName, activity.LastName) + " enrolled in " + activity.CourseName,
                OccurredAt = activity.OccurredAt,
                Tone = "info",
                Icon = "BookOpenCheck"
            })
            .Concat(paymentActivities.Select(activity => new ActivityLogDto
            {
                Title = "Payment #" + activity.PaymentId + " for " + activity.CourseName + " marked " + activity.Status,
                OccurredAt = activity.OccurredAt,
                Tone = activity.Status == "Paid" ? "success" : activity.Status == "Failed" ? "danger" : "neutral",
                Icon = "BadgeDollarSign"
            }))
            .Concat(serviceActivities.Select(activity => new ActivityLogDto
            {
                Title = BuildFullName(activity.FirstName, activity.LastName) + " requested " + activity.ServiceName,
                OccurredAt = activity.OccurredAt,
                Tone = activity.Status == "Approved" ? "success" : activity.Status == "Rejected" ? "danger" : "info",
                Icon = "ClipboardList"
            }))
            .Concat(rideActivities.Select(activity => new ActivityLogDto
            {
                Title = BuildFullName(activity.FirstName, activity.LastName) + " booked a ride with " + BuildFullName(activity.DriverFirstName, activity.DriverLastName),
                OccurredAt = activity.OccurredAt,
                Tone = activity.Status == "Completed" ? "success" : activity.Status == "Cancelled" ? "danger" : "neutral",
                Icon = "BusFront"
            }))
            .OrderByDescending(activity => activity.OccurredAt)
            .Take(maxLimit)
            .ToList();
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
