using StudentManagement.Application.DTOs.Dashboard;

namespace StudentManagement.Application.Interfaces;

public interface IInstructorDashboardService
{
    Task<InstructorDashboardSummaryDto> GetSummaryAsync(string userId);
    Task<IEnumerable<InstructorDashboardCourseDto>> GetCoursesAsync(string userId);
    Task<IReadOnlyList<ActivityLogDto>> GetRecentActivitiesAsync(string userId, int limit);
}
