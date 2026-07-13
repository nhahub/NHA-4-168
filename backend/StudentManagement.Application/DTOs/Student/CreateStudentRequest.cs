namespace StudentManagement.Application.DTOs.Student;

public class CreateStudentRequest
{
    public long? StudentSsn { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Address { get; set; }
    public DateTime? EnrollmentDate { get; set; }
    public string? Status { get; set; }
}
