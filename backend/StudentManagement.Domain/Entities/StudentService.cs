namespace StudentManagement.Domain.Entities;

public class StudentService
{
    public int       StudentServiceId { get; set; }
    public int       StudentSsn       { get; set; }
    public int       ServiceId        { get; set; }
    public DateTime? RequestedDate    { get; set; }
    public string    Status           { get; set; } = "Pending";

    public Student Student { get; set; } = null!;
    public Service Service { get; set; } = null!;
}
