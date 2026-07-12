using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.DTOs.Dashboard;
using StudentManagement.Application.Interfaces;
using Microsoft.Extensions.Logging;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Services;

public class InstructorDashboardService : IInstructorDashboardService
{
    private readonly AppDbContext _context;
    private readonly ILogger<InstructorDashboardService> _logger;

    public InstructorDashboardService(AppDbContext context, ILogger<InstructorDashboardService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<InstructorDashboardSummaryDto> GetSummaryAsync(string userId)
    {
        var instructor = await _context.Instructors
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.UserId == userId);

        if (instructor == null)
        {
            _logger.LogWarning("Instructor with UserId {UserId} not found.", userId);
            return new InstructorDashboardSummaryDto { Rating = 0m };
        }

        var activeCourses = await _context.CourseInstructors
            .AsNoTracking()
            .CountAsync(ci => ci.InstructorSsn == instructor.InstructorSsn && ci.Course.IsActive);

        var totalStudents = await _context.Enrollments
            .AsNoTracking()
            .Where(e => _context.CourseInstructors.Any(ci => ci.InstructorSsn == instructor.InstructorSsn && ci.CourseId == e.CourseId))
            .Select(e => e.StudentSsn)
            .Distinct()
            .CountAsync();

        return new InstructorDashboardSummaryDto
        {
            ActiveCourses = activeCourses,
            TotalStudents = totalStudents,
            Rating = instructor.Rating ?? 0m
        };
    }

    public async Task<IEnumerable<InstructorDashboardCourseDto>> GetCoursesAsync(string userId)
    {
        var instructor = await _context.Instructors
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.UserId == userId);

        if (instructor == null) return Enumerable.Empty<InstructorDashboardCourseDto>();

        return await _context.CourseInstructors
            .AsNoTracking()
            .Include(ci => ci.Course)
                .ThenInclude(c => c.Enrollments)
            .Where(ci => ci.InstructorSsn == instructor.InstructorSsn)
            .Select(ci => new InstructorDashboardCourseDto
            {
                CourseId = ci.CourseId,
                CourseName = ci.Course.CourseName,
                Role = ci.Role,
                EnrolledStudentsCount = ci.Course.Enrollments.Count,
                StartDate = ci.Course.StartDate,
                EndDate = ci.Course.EndDate,
                IsActive = ci.Course.IsActive
            })
            .ToListAsync();
    }

    public async Task<IReadOnlyList<ActivityLogDto>> GetRecentActivitiesAsync(string userId, int limit)
    {
        var instructor = await _context.Instructors
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.UserId == userId);

        if (instructor == null)
            return new List<ActivityLogDto>();

        var maxLimit = limit <= 0 ? int.MaxValue : limit;

        // Fetch recent enrollments to the courses taught by this instructor
        var enrollmentActivities = await _context.Enrollments
            .AsNoTracking()
            .Include(e => e.Student)
            .Include(e => e.Course)
            .Where(e => _context.CourseInstructors.Any(ci => ci.InstructorSsn == instructor.InstructorSsn && ci.CourseId == e.CourseId))
            .OrderByDescending(e => e.EnrolledOn ?? DateTime.MinValue)
            .Take(maxLimit)
            .Select(e => new
            {
                StudentName = e.Student.FirstName + " " + e.Student.LastName,
                e.Course.CourseName,
                OccurredAt = e.EnrolledOn ?? DateTime.MinValue
            })
            .ToListAsync();

        return enrollmentActivities
            .Select(activity => new ActivityLogDto
            {
                Title = $"{activity.StudentName} enrolled in your course {activity.CourseName}",
                OccurredAt = activity.OccurredAt,
                Tone = "success",
                Icon = "GraduationCap"
            })
            .OrderByDescending(activity => activity.OccurredAt)
            .Take(maxLimit)
            .ToList();
    }
}
