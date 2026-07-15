using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using StudentManagement.Application.DTOs.Instructor;
using StudentManagement.Application.Interfaces;

namespace StudentManagement.API.Controllers;

[ApiController]
[Authorize]
[Route("api/instructor-ratings")]
public class InstructorRatingsController : ControllerBase
{
    private readonly IInstructorRatingService _ratingService;

    public InstructorRatingsController(IInstructorRatingService ratingService)
    {
        _ratingService = ratingService;
    }

    [HttpPost]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<InstructorRatingDto>> Rate([FromBody] CreateInstructorRatingDto dto)
    {
        var result = await _ratingService.RateAsync(GetUserId(), dto);
        return Ok(result);
    }

    [HttpGet("eligible")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<IReadOnlyList<InstructorToRateDto>>> GetEligible()
    {
        var result = await _ratingService.GetEligibleInstructorsAsync(GetUserId());
        return Ok(result);
    }

    [HttpGet("mine")]
    [Authorize(Roles = "Instructor")]
    public async Task<ActionResult<IReadOnlyList<InstructorRatingDto>>> GetMine()
    {
        var result = await _ratingService.GetRatingsForInstructorAsync(GetUserId());
        return Ok(result);
    }

    [HttpGet("average/{ssn:long}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult<decimal>> GetAverage(long ssn)
    {
        var average = await _ratingService.GetAverageRatingAsync(ssn);
        return Ok(average);
    }

    [HttpGet("instructor/{ssn:long}")]
    [Authorize(Roles = "Admin,Student")]
    public async Task<ActionResult<IReadOnlyList<InstructorRatingDto>>> GetByInstructor(long ssn)
    {
        var result = await _ratingService.GetRatingsForInstructorBySsnAsync(ssn);
        return Ok(result);
    }

    private string? GetUserId()
    {
        return User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}
