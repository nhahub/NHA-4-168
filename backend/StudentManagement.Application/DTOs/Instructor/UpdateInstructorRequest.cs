namespace StudentManagement.Application.DTOs.Instructor;

public class UpdateInstructorRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Specialization { get; set; }
    public DateTime? HireDate { get; set; }
}
