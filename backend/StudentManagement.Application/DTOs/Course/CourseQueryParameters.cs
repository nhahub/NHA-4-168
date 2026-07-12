namespace StudentManagement.Application.DTOs.Course;

public class CourseQueryParameters
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public string? Level { get; set; }
    public bool? IsPaid { get; set; }
    public DateTime? StartDateFrom { get; set; }
    public bool? HasCapacity { get; set; }
}
