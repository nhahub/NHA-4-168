using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.DTOs.Dashboard;
using StudentManagement.Application.DTOs.Trip;
using StudentManagement.Application.Interfaces;
using Microsoft.Extensions.Logging;
using StudentManagement.Domain.Entities;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Services;

public class StudentDashboardService : IStudentDashboardService
{
    private readonly AppDbContext _context;
    private readonly ILogger<StudentDashboardService> _logger;

    public StudentDashboardService(AppDbContext context, ILogger<StudentDashboardService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<StudentDashboardSummaryDto> GetSummaryAsync(string userId)
    {
        var student = await _context.Students
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null)
        {
            _logger.LogWarning("Student with UserId {UserId} not found.", userId);
            return new StudentDashboardSummaryDto { Status = "N/A" };
        }

        var activeCourses = await _context.Enrollments
            .AsNoTracking()
            .CountAsync(e => e.StudentSsn == student.StudentSsn && e.Status == "Active");

        var activeRides = await _context.TripStudents
            .AsNoTracking()
            .CountAsync(ts => ts.StudentSsn == student.StudentSsn && ts.Trip != null && ts.Trip.Status == "InProgress");

        var pendingPayments = await _context.Payments
            .AsNoTracking()
            .Where(p => p.Enrollment != null && p.Enrollment.StudentSsn == student.StudentSsn && p.Status == "Pending")
            .SumAsync(p => (decimal?)p.Amount) ?? 0m;

        return new StudentDashboardSummaryDto
        {
            ActiveCourses = activeCourses,
            ActiveRides = activeRides,
            PendingPayments = pendingPayments,
            Status = student.Status
        };
    }

    public async Task<IEnumerable<StudentCourseDto>> GetCoursesAsync(string userId)
    {
        var student = await _context.Students
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null) return Enumerable.Empty<StudentCourseDto>();

        return await _context.Enrollments
            .AsNoTracking()
            .Include(e => e.Course)
                .ThenInclude(c => c.CourseInstructors)
                    .ThenInclude(ci => ci.Instructor)
            .Where(e => e.StudentSsn == student.StudentSsn)
            .Select(e => new StudentCourseDto
            {
                CourseId = e.CourseId,
                CourseName = e.Course.CourseName,
                InstructorName = e.Course.CourseInstructors.Select(ci => ci.Instructor.FirstName + " " + ci.Instructor.LastName).FirstOrDefault() ?? string.Empty,
                EnrolledOn = e.EnrolledOn,
                Status = e.Status,
                Grade = e.Grade
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<TripDto>> GetTripsAsync(string userId)
    {
        var student = await _context.Students
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null) return Enumerable.Empty<TripDto>();

        return await _context.Trips
            .AsNoTracking()
            .Include(t => t.Driver)
            .Include(t => t.TripStudents)
                .ThenInclude(ts => ts.Student)
            .Where(t => t.TripStudents.Any(ts => ts.StudentSsn == student.StudentSsn))
            .Select(trip => new TripDto
            {
                TripId = trip.TripId,
                DriverSsn = trip.DriverSsn,
                DriverName = trip.Driver != null ? (trip.Driver.FirstName + " " + trip.Driver.LastName).Trim() : string.Empty,
                Destination = trip.Destination,
                PickupArea = trip.PickupArea,
                EstimatedTimeOfArrival = trip.EstimatedTimeOfArrival,
                Status = trip.Status,
                Price = trip.Price,
                MaxSeats = StudentManagement.Domain.Entities.Trip.MaxSeats,
                SeatsTaken = trip.TripStudents.Count,
                Students = trip.TripStudents.Select(ts => new TripStudentDto
                {
                    StudentSsn = ts.StudentSsn,
                    StudentName = ts.Student != null ? (ts.Student.FirstName + " " + ts.Student.LastName).Trim() : string.Empty,
                    JoinedAt = ts.JoinedAt
                }).ToList()
            })
            .ToListAsync();
    }

    public async Task<IReadOnlyList<ActivityLogDto>> GetRecentActivitiesAsync(string userId, int limit)
    {
        var student = await _context.Students
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (student == null)
            return new List<ActivityLogDto>();

        var maxLimit = limit <= 0 ? int.MaxValue : limit;

        string BuildFullName(string firstName, string lastName)
        {
            return $"{firstName} {lastName}".Trim();
        }

        var enrollmentActivities = await _context.Enrollments
            .AsNoTracking()
            .Where(e => e.StudentSsn == student.StudentSsn)
            .OrderByDescending(e => e.EnrolledOn ?? DateTime.MinValue)
            .Select(e => new
            {
                e.Course.CourseName,
                OccurredAt = e.EnrolledOn ?? DateTime.MinValue
            })
            .ToListAsync();

        var paymentActivities = await _context.Payments
            .AsNoTracking()
            .Where(p => p.Enrollment.StudentSsn == student.StudentSsn)
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
            .Where(ss => ss.StudentSsn == student.StudentSsn)
            .OrderByDescending(ss => ss.RequestedDate ?? DateTime.MinValue)
            .Select(ss => new
            {
                ss.Service.ServiceName,
                ss.Status,
                OccurredAt = ss.RequestedDate ?? DateTime.MinValue
            })
            .ToListAsync();

        var rideActivities = await _context.TripStudents
            .AsNoTracking()
            .Where(ts => ts.StudentSsn == student.StudentSsn)
            .OrderByDescending(ts => ts.JoinedAt)
            .Select(ts => new
            {
                DriverFirstName = ts.Trip.Driver.FirstName,
                DriverLastName = ts.Trip.Driver.LastName,
                Destination = ts.Trip.Destination,
                OccurredAt = ts.JoinedAt,
                Status = ts.Trip.Status
            })
            .ToListAsync();

        return enrollmentActivities
            .Select(activity => new ActivityLogDto
            {
                Title = $"You enrolled in {activity.CourseName}",
                OccurredAt = activity.OccurredAt,
                Tone = "info",
                Icon = "BookOpenCheck"
            })
            .Concat(paymentActivities.Select(activity => new ActivityLogDto
            {
                Title = $"Your payment for {activity.CourseName} was {activity.Status}",
                OccurredAt = activity.OccurredAt,
                Tone = activity.Status == "Paid"
                    ? "success"
                    : activity.Status == "Failed"
                        ? "danger"
                        : "neutral",
                Icon = "BadgeDollarSign"
            }))
            .Concat(serviceActivities.Select(activity => new ActivityLogDto
            {
                Title = $"You requested {activity.ServiceName}",
                OccurredAt = activity.OccurredAt,
                Tone = activity.Status == "Approved"
                    ? "success"
                    : activity.Status == "Rejected"
                        ? "danger"
                        : "info",
                Icon = "ClipboardList"
            }))
            .Concat(rideActivities.Select(activity => new ActivityLogDto
            {
                Title = $"You booked a ride with {BuildFullName(activity.DriverFirstName, activity.DriverLastName)} to {activity.Destination}",
                OccurredAt = activity.OccurredAt,
                Tone = activity.Status == "Completed"
                    ? "success"
                    : activity.Status == "Cancelled"
                        ? "danger"
                        : "neutral",
                Icon = "BusFront"
            }))
            .OrderByDescending(activity => activity.OccurredAt)
            .Take(maxLimit)
            .ToList();
    }
}
