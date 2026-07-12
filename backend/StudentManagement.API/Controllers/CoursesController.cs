using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Application.DTOs.Course;
using StudentManagement.Application.Interfaces;

namespace StudentManagement.API.Controllers;

[ApiController]
[Authorize]
[Route("api/courses")]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpGet]
    public async Task<ActionResult> GetCourses([FromQuery] CourseQueryParameters query)
    {
        var courses = await _courseService.GetCoursesAsync(query);
        return Ok(courses);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetCourse(int id)
    {
        var course = await _courseService.GetCourseAsync(id);
        return Ok(course);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> CreateCourse([FromBody] CreateCourseRequest request)
    {
        var course = await _courseService.CreateCourseAsync(request);
        return CreatedAtAction(nameof(GetCourse), new { id = course.CourseId }, course);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateCourse(int id, [FromBody] UpdateCourseRequest request)
    {
        var course = await _courseService.UpdateCourseAsync(id, request);
        return Ok(course);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeactivateCourse(int id)
    {
        await _courseService.DeactivateCourseAsync(id);
        return NoContent();
    }

    [HttpPost("{id:int}/instructors")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AssignInstructor(int id, [FromBody] AssignInstructorRequest request)
    {
        var assignment = await _courseService.AssignInstructorAsync(id, request);
        return CreatedAtAction(nameof(GetCourse), new { id }, assignment);
    }

    [HttpDelete("{id:int}/instructors/{ssn:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> RemoveInstructor(int id, int ssn)
    {
        await _courseService.RemoveInstructorAsync(id, ssn);
        return NoContent();
    }
}
