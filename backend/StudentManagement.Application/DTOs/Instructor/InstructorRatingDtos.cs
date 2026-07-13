namespace StudentManagement.Application.DTOs.Instructor;

public class CreateInstructorRatingDto
{
    public long InstructorSsn { get; set; }
    public decimal Score { get; set; }
    public string? Comment { get; set; }
}

public class InstructorRatingDto
{
    public long StudentSsn { get; set; }
    public long InstructorSsn { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public decimal Score { get; set; }
    public string? Comment { get; set; }
    public DateTime RatedAt { get; set; }
}

public class InstructorToRateDto
{
    public long InstructorSsn { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public List<string> Courses { get; set; } = new();
    public decimal? MyScore { get; set; }
}
