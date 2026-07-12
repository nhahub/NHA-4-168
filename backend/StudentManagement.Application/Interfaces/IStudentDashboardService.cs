using StudentManagement.Application.DTOs.Dashboard;
using StudentManagement.Application.DTOs.Trip;

namespace StudentManagement.Application.Interfaces;

public interface IStudentDashboardService
{
    Task<StudentDashboardSummaryDto> GetSummaryAsync(string userId);
    Task<IEnumerable<StudentCourseDto>> GetCoursesAsync(string userId);
    Task<IEnumerable<TripDto>> GetTripsAsync(string userId);

    Task<IReadOnlyList<ActivityLogDto>> GetRecentActivitiesAsync(string userId, int limit);
}
