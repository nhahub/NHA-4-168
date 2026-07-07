using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Domain.Entities;

public class Service
{
    [Key]
    public int ServiceId { get; set; }

    [Required, MaxLength(100)]
    public string ServiceName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public TimeOnly? StartTime { get; set; }

    public TimeOnly? EndTime { get; set; }

    [MaxLength(50)]
    public string? WorkingDays { get; set; }

    [MaxLength(255)]
    public string? Location { get; set; }

    [MaxLength(255)]
    public string? Website { get; set; }

    public ICollection<StudentService> StudentServices { get; set; } = [];
}
