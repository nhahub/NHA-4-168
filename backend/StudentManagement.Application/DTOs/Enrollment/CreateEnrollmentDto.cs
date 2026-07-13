namespace StudentManagement.Application.DTOs.Enrollment;

public class CreateEnrollmentDto
{
    public long StudentSsn { get; set; }
    public int CourseId { get; set; }
}