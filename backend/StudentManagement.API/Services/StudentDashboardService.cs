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
}
