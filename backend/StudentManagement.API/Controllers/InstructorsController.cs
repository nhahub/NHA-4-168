using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using StudentManagement.Application.DTOs.Instructor;
using StudentManagement.Application.Interfaces;

namespace StudentManagement.API.Controllers;

[ApiController]
[Authorize]
[Route("api/instructors")]
public class InstructorsController : ControllerBase
{
    private readonly IInstructorService _instructorService;

    public InstructorsController(IInstructorService instructorService)
    {
        _instructorService = instructorService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Student")]
    public async Task<ActionResult> GetInstructors([FromQuery] InstructorQueryParameters query)
    {
        var instructors = await _instructorService.GetInstructorsAsync(query);
        return Ok(instructors);
    }

    [HttpGet("{ssn:long}")]
    public async Task<ActionResult> GetInstructor(long ssn)
    {
        var instructor = await _instructorService.GetInstructorAsync(ssn, GetUserId(), GetRoles());
        return Ok(instructor);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> CreateInstructor([FromBody] CreateInstructorRequest request)
    {
        var instructor = await _instructorService.CreateInstructorAsync(request);
        return CreatedAtAction(nameof(GetInstructor), new { ssn = instructor.InstructorSsn }, instructor);
    }

    [HttpPut("{ssn:long}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateInstructor(long ssn, [FromBody] UpdateInstructorRequest request)
    {
        var instructor = await _instructorService.UpdateInstructorAsync(ssn, request);
        return Ok(instructor);
    }

    private string? GetUserId()
    {
        return User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private IEnumerable<string> GetRoles()
    {
        return User.FindAll(ClaimTypes.Role).Select(claim => claim.Value);
    }
}
