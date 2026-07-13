namespace StudentManagement.Application.DTOs.Course;

public class CourseInstructorResponse
{
    public int CourseId { get; set; }
    public long InstructorSsn { get; set; }
    public string? Role { get; set; }
    public DateTime? AssignedOn { get; set; }
}
