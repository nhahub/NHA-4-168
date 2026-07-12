using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Application.DTOs.Dashboard;
using StudentManagement.Application.DTOs.Trip;
using StudentManagement.Application.Interfaces;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace StudentManagement.API.Controllers;

[ApiController]
[Authorize(Roles = "Student")]
[Route("api/student-dashboard")]
public class StudentDashboardController : ControllerBase
{
    private readonly IStudentDashboardService _studentDashboardService;

    private readonly ILogger<StudentDashboardController> _logger;

    public StudentDashboardController(IStudentDashboardService studentDashboardService, ILogger<StudentDashboardController> logger)
    {
        _studentDashboardService = studentDashboardService;
        _logger = logger;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<StudentDashboardSummaryDto>> GetSummary()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        
        try
        {
            var summary = await _studentDashboardService.GetSummaryAsync(userId);
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving student dashboard summary for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("courses")]
    public async Task<ActionResult<IEnumerable<StudentCourseDto>>> GetCourses()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        
        var courses = await _studentDashboardService.GetCoursesAsync(userId);
        return Ok(courses);
    }

    [HttpGet("trips")]
    public async Task<ActionResult<IEnumerable<TripDto>>> GetTrips()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        
        var trips = await _studentDashboardService.GetTripsAsync(userId);
        return Ok(trips);
    }

    [HttpGet("activities")]
    public async Task<ActionResult<IReadOnlyList<ActivityLogDto>>> GetRecentActivities(
        [FromQuery] int limit = 10)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var activities =
            await _studentDashboardService.GetRecentActivitiesAsync(userId, limit);

        return Ok(activities);
    }
}
