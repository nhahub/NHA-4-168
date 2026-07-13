namespace StudentManagement.Application.DTOs.Instructor;

public class CreateInstructorRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Specialization { get; set; }
    public decimal? CommissionRate { get; set; }
    public DateTime? HireDate { get; set; }
}
