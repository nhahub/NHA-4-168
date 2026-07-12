using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Application.DTOs.Dashboard;
using StudentManagement.Application.DTOs.Trip;
using StudentManagement.Application.Interfaces;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace StudentManagement.API.Controllers;

[ApiController]
[Authorize(Roles = "Driver")]
[Route("api/driver-dashboard")]
public class DriverDashboardController : ControllerBase
{
    private readonly IDriverDashboardService _driverDashboardService;
    private readonly ILogger<DriverDashboardController> _logger;

    public DriverDashboardController(IDriverDashboardService driverDashboardService, ILogger<DriverDashboardController> logger)
    {
        _driverDashboardService = driverDashboardService;
        _logger = logger;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DriverDashboardSummaryDto>> GetSummary()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        
        try
        {
            var summary = await _driverDashboardService.GetSummaryAsync(userId);
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving driver dashboard summary for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("trips")]
    public async Task<ActionResult<IEnumerable<TripDto>>> GetTrips()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        
        try
        {
            var trips = await _driverDashboardService.GetTripsAsync(userId);
            return Ok(trips);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving driver dashboard trips for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("activities")]
    public async Task<ActionResult<IReadOnlyList<ActivityLogDto>>> GetRecentActivities([FromQuery] int limit = 10)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            var activities = await _driverDashboardService.GetRecentActivitiesAsync(userId, limit);
            return Ok(activities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving driver dashboard activities for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }
}
