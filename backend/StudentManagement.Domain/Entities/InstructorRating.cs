namespace StudentManagement.Domain.Entities;

public class InstructorRating
{
    public long StudentSsn { get; set; }
    public long InstructorSsn { get; set; }
    public decimal Score { get; set; }
    public string? Comment { get; set; }
    public DateTime RatedAt { get; set; }

    public Student? Student { get; set; }
    public Instructor? Instructor { get; set; }
}
