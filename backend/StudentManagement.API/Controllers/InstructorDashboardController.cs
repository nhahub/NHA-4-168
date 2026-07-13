using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Application.DTOs.Dashboard;
using StudentManagement.Application.Interfaces;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace StudentManagement.API.Controllers;

[ApiController]
[Authorize(Roles = "Instructor")]
[Route("api/instructor-dashboard")]
public class InstructorDashboardController : ControllerBase
{
    private readonly IInstructorDashboardService _instructorDashboardService;
    private readonly ILogger<InstructorDashboardController> _logger;

    public InstructorDashboardController(IInstructorDashboardService instructorDashboardService, ILogger<InstructorDashboardController> logger)
    {
        _instructorDashboardService = instructorDashboardService;
        _logger = logger;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<InstructorDashboardSummaryDto>> GetSummary()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        
        try
        {
            var summary = await _instructorDashboardService.GetSummaryAsync(userId);
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving instructor dashboard summary for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("courses")]
    public async Task<ActionResult<IEnumerable<InstructorDashboardCourseDto>>> GetCourses()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        
        try
        {
            var courses = await _instructorDashboardService.GetCoursesAsync(userId);
            return Ok(courses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving instructor dashboard courses for user {UserId}", userId);
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
            var activities = await _instructorDashboardService.GetRecentActivitiesAsync(userId, limit);
            return Ok(activities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving instructor dashboard activities for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("courses/{courseId:int}/students")]
    public async Task<ActionResult<IEnumerable<InstructorDashboardStudentDto>>> GetCourseStudents(int courseId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            var students = await _instructorDashboardService.GetCourseStudentsAsync(userId, courseId);
            return Ok(students);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving students for course {CourseId}, user {UserId}", courseId, userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("payments")]
    public async Task<ActionResult<InstructorPaymentSummaryDto>> GetPayments()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            var payments = await _instructorDashboardService.GetPaymentsAsync(userId);
            return Ok(payments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payments for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }
}
