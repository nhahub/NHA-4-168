namespace StudentManagement.Application.DTOs.Enrollment;

public class EnrollmentDto
{
    public int EnrollmentId { get; set; }
    public int StudentSsn { get; set; }
    public string StudentName { get; set; } = string.Empty;

    public int CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;

    public DateTime? EnrolledOn { get; set; }
    public string? Grade { get; set; }
    public string Status { get; set; } = string.Empty;

    public string? PaymentStatus { get; set; }
}