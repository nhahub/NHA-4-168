namespace StudentManagement.Application.DTOs.Instructor;

public class InstructorQueryParameters
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public string? Specialization { get; set; }
}
