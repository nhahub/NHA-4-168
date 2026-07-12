using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using StudentManagement.Application.DTOs.Student;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Exceptions;

namespace StudentManagement.API.Controllers;

[ApiController]
[Authorize]
[Route("api/students")]
public class StudentsController : ControllerBase
{
    private static readonly HashSet<string> RestrictedSelfUpdateFields = new(StringComparer.OrdinalIgnoreCase)
    {
        "studentSsn",
        "firstName",
        "lastName",
        "email",
        "enrollmentDate",
        "status",
        "userId"
    };

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IStudentService _studentService;

    public StudentsController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> GetStudents([FromQuery] StudentQueryParameters query)
    {
        var students = await _studentService.GetStudentsAsync(query);
        return Ok(students);
    }

    [HttpGet("{ssn:int}")]
    public async Task<ActionResult> GetStudent(int ssn)
    {
        var student = await _studentService.GetStudentAsync(ssn, GetUserId(), GetRoles());
        return Ok(student);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> CreateStudent([FromBody] CreateStudentRequest request)
    {
        var student = await _studentService.CreateStudentAsync(request);
        return CreatedAtAction(nameof(GetStudent), new { ssn = student.StudentSsn }, student);
    }

    [HttpPut("{ssn:int}")]
    public async Task<ActionResult> UpdateStudent(int ssn, [FromBody] JsonElement body)
    {
        if (!IsAdmin() && ContainsRestrictedSelfUpdateField(body))
        {
            throw new ValidationException(
                "Validation failed.",
                new Dictionary<string, string[]>
                {
                    ["request"] = ["Students may only update phone, address, and date of birth."]
                });
        }

        var request = body.Deserialize<UpdateStudentRequest>(JsonOptions)
            ?? throw new ValidationException("Validation failed.", new Dictionary<string, string[]>
            {
                ["request"] = ["Request body is required."]
            });

        var student = await _studentService.UpdateStudentAsync(ssn, request, GetUserId(), GetRoles());
        return Ok(student);
    }

    [HttpPatch("{ssn:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateStudentStatus(int ssn, [FromBody] UpdateStudentStatusRequest request)
    {
        var status = await _studentService.UpdateStudentStatusAsync(ssn, request);
        return Ok(status);
    }

    private bool IsAdmin()
    {
        return User.IsInRole("Admin");
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

    private static bool ContainsRestrictedSelfUpdateField(JsonElement body)
    {
        if (body.ValueKind != JsonValueKind.Object)
        {
            throw new ValidationException("Validation failed.", new Dictionary<string, string[]>
            {
                ["request"] = ["Request body must be a JSON object."]
            });
        }

        return body.EnumerateObject()
            .Any(property => RestrictedSelfUpdateFields.Contains(property.Name));
    }

    [HttpGet("me")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult> GetCurrentStudent()
    {
        var userId = GetUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var student = await _studentService.GetCurrentStudentAsync(userId);

        return Ok(student);
    }
}

