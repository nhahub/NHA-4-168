namespace StudentManagement.Domain.Entities;

public class Service
{
    public int       ServiceId   { get; set; }
    public string    ServiceName { get; set; } = string.Empty;
    public string?   Description { get; set; }
    public TimeOnly? StartTime   { get; set; }
    public TimeOnly? EndTime     { get; set; }
    public string?   WorkingDays { get; set; }
    public string?   Location    { get; set; }
    public string?   Website     { get; set; }

    public ICollection<StudentService> StudentServices { get; set; } = [];
}
