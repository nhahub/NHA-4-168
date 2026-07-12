namespace StudentManagement.Application.DTOs.Course;

public class CreateCourseRequest
{
    public string CourseName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? MaxCapacity { get; set; }
    public decimal? Fee { get; set; }
    public string? Level { get; set; }
    public bool IsPaid { get; set; }
}
