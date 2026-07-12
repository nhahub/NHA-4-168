namespace StudentManagement.Domain.Entities;

public class Course
{
    public int       CourseId    { get; set; }
    public string    CourseName  { get; set; } = string.Empty;
    public string?   Description { get; set; }
    public DateTime? StartDate   { get; set; }
    public DateTime? EndDate     { get; set; }
    public int?      MaxCapacity { get; set; }
    public decimal?  Fee         { get; set; }
    public string?   Level       { get; set; }
    public bool      IsPaid      { get; set; }
    public bool      IsActive    { get; set; } = true;

    public ICollection<Enrollment>       Enrollments       { get; set; } = new List<Enrollment>();
    public ICollection<CourseInstructor> CourseInstructors { get; set; } = new List<CourseInstructor>();
}
