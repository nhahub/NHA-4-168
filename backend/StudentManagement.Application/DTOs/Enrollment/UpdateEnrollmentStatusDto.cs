namespace StudentManagement.Application.DTOs.Enrollment;

public class UpdateEnrollmentStatusDto
{
    public string Status { get; set; } = string.Empty;
    public string? Grade { get; set; }
}