namespace StudentManagement.Application.DTOs.Student;

public class StudentQueryParameters
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public string? Status { get; set; }
    public DateTime? EnrollmentDateFrom { get; set; }
    public DateTime? EnrollmentDateTo { get; set; }
}
