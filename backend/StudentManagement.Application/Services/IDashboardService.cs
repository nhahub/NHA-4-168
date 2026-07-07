using StudentManagement.Application.DTOs.Dashboard;

namespace StudentManagement.Application.Services;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync();
    Task<IReadOnlyList<EnrollmentTrendDto>> GetEnrollmentTrendsAsync(DateRange range);
    Task<IReadOnlyList<StudentApplicationDto>> GetRecentStudentApplicationsAsync(int limit);
    Task<IReadOnlyList<ActivityLogDto>> GetRecentActivitiesAsync(int limit);
}