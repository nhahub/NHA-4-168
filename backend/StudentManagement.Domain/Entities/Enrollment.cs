namespace StudentManagement.Domain.Entities;

public class Enrollment
{
    public int       EnrollmentId { get; set; }
    public int       StudentSsn   { get; set; }
    public int       CourseId     { get; set; }
    public DateTime? EnrolledOn   { get; set; }
    public string?   Grade        { get; set; }
    public string    Status       { get; set; } = "Active";

    public Student  Student  { get; set; } = null!;
    public Course   Course   { get; set; } = null!;
    public Payment? Payment  { get; set; }
}
