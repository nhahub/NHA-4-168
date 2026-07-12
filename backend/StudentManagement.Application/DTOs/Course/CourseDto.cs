namespace StudentManagement.Application.DTOs.Course;

public class CourseDto
{
    public int CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Level { get; set; }
    public decimal? Fee { get; set; }
    public bool IsPaid { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? MaxCapacity { get; set; }
    public int EnrolledCount { get; set; }
    public int? AvailableSeats { get; set; }
    public bool IsActive { get; set; }
    public List<CourseInstructorSummaryDto> Instructors { get; set; } = new();
}
