namespace StudentManagement.Domain.Entities;

public class CourseInstructor
{
    public int       CourseId      { get; set; }
    public int       InstructorSsn { get; set; }
    public string?   Role          { get; set; }
    public DateTime? AssignedOn    { get; set; }

    public Course     Course     { get; set; } = null!;
    public Instructor Instructor { get; set; } = null!;
}
