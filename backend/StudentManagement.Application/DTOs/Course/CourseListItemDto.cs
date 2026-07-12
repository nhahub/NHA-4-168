namespace StudentManagement.Application.DTOs.Course;

public class CourseListItemDto
{
    public int CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public string? Level { get; set; }
    public decimal? Fee { get; set; }
    public bool IsPaid { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? MaxCapacity { get; set; }
    public int EnrolledCount { get; set; }
    public int? AvailableSeats { get; set; }
    public bool IsActive { get; set; }
}
