using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Application.DTOs.Dashboard;
using StudentManagement.Application.Services;
using System.Text;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous] // Temporarily disabled auth for dev
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummaryAsync()
    {
        return Ok(await _dashboardService.GetSummaryAsync());
    }

    [HttpGet("enrollment-trends")]
    public async Task<ActionResult<IReadOnlyList<EnrollmentTrendDto>>> GetEnrollmentTrendsAsync([FromQuery] DateRange range)
    {
        return Ok(await _dashboardService.GetEnrollmentTrendsAsync(range));
    }

    // Recent preview (limit)
    [HttpGet("applications")]
    public async Task<ActionResult<IReadOnlyList<StudentApplicationDto>>> GetRecentStudentApplicationsAsync([FromQuery] int limit = 5)
    {
        return Ok(await _dashboardService.GetRecentStudentApplicationsAsync(limit));
    }

    // Full directory (no limit)
    [HttpGet("applications/all")]
    public async Task<ActionResult<IReadOnlyList<StudentApplicationDto>>> GetAllStudentApplicationsAsync()
    {
        return Ok(await _dashboardService.GetRecentStudentApplicationsAsync(int.MaxValue));
    }

    // Recent preview (limit)
    [HttpGet("activities")]
    public async Task<ActionResult<IReadOnlyList<ActivityLogDto>>> GetRecentActivitiesAsync([FromQuery] int limit = 5)
    {
        return Ok(await _dashboardService.GetRecentActivitiesAsync(limit));
    }

    // Full log (no limit)
    [HttpGet("activities/all")]
    public async Task<ActionResult<IReadOnlyList<ActivityLogDto>>> GetAllActivitiesAsync()
    {
        return Ok(await _dashboardService.GetRecentActivitiesAsync(int.MaxValue));
    }

    // CSV export of the full dashboard summary
    [HttpGet("export")]
    public async Task<IActionResult> ExportReportAsync()
    {
        var summary = await _dashboardService.GetSummaryAsync();
        var applications = await _dashboardService.GetRecentStudentApplicationsAsync(int.MaxValue);

        var sb = new StringBuilder();

        // --- Summary section ---
        sb.AppendLine("=== Dashboard Summary ===");
        sb.AppendLine($"Generated At,{DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
        sb.AppendLine($"Total Students,{summary.TotalStudents}");
        sb.AppendLine($"Active Enrollments,{summary.ActiveEnrollments}");
        sb.AppendLine($"Pending Payments,{summary.PendingPayments}");
        sb.AppendLine($"Pending Service Requests,{summary.PendingServiceRequests}");
        sb.AppendLine($"Active Rides,{summary.ActiveRides}");
        sb.AppendLine($"Total Revenue,{summary.TotalRevenue:F2}");
        sb.AppendLine();

        // --- Applications section ---
        sb.AppendLine("=== Student Applications ===");
        sb.AppendLine("Student Name,Course Applied,Application Date,Status");
        foreach (var app in applications)
        {
            var date = app.AppliedOn.HasValue
                ? app.AppliedOn.Value.ToString("yyyy-MM-dd")
                : "";
            sb.AppendLine($"\"{app.StudentName}\",\"{app.CourseName}\",{date},\"{app.Status}\"");
        }

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        var fileName = $"dashboard-report-{DateTime.UtcNow:yyyyMMdd}.csv";
        return File(bytes, "text/csv", fileName);
    }
}
