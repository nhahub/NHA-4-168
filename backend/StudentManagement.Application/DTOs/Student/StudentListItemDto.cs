namespace StudentManagement.Application.DTOs.Student;

public class StudentListItemDto
{
    public int StudentSsn { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? EnrollmentDate { get; set; }
}
