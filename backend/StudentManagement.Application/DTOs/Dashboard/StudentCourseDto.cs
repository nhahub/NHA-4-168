namespace StudentManagement.Application.DTOs.Dashboard;

public class StudentCourseDto
{
    public int CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public DateTime? EnrolledOn { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Grade { get; set; }
}
