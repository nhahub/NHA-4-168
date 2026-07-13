namespace StudentManagement.Application.DTOs.Course;

public class CourseInstructorSummaryDto
{
    public long InstructorSsn { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Role { get; set; }
    public DateTime? AssignedOn { get; set; }
}
