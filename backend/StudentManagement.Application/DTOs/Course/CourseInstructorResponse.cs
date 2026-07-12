namespace StudentManagement.Application.DTOs.Course;

public class CourseInstructorResponse
{
    public int CourseId { get; set; }
    public int InstructorSsn { get; set; }
    public string? Role { get; set; }
    public DateTime? AssignedOn { get; set; }
}
