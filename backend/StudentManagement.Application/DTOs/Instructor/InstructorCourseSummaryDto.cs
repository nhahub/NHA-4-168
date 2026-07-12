namespace StudentManagement.Application.DTOs.Instructor;

public class InstructorCourseSummaryDto
{
    public int CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public string? Role { get; set; }
}
