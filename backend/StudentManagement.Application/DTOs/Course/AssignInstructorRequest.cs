namespace StudentManagement.Application.DTOs.Course;

public class AssignInstructorRequest
{
    public long InstructorSsn { get; set; }
    public string? Role { get; set; }
}
