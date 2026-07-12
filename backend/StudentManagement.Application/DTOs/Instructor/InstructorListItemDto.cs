namespace StudentManagement.Application.DTOs.Instructor;

public class InstructorListItemDto
{
    public int InstructorSsn { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Specialization { get; set; }
    public decimal? Rating { get; set; }
    public DateTime? HireDate { get; set; }
}
