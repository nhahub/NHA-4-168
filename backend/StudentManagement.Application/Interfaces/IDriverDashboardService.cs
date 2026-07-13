using StudentManagement.Application.DTOs.Dashboard;
using StudentManagement.Application.DTOs.Trip;

namespace StudentManagement.Application.Interfaces;

public interface IDriverDashboardService
{
    Task<DriverDashboardSummaryDto> GetSummaryAsync(string userId);
    Task<IEnumerable<TripDto>> GetTripsAsync(string userId);
    Task<IReadOnlyList<ActivityLogDto>> GetRecentActivitiesAsync(string userId, int limit);
}
