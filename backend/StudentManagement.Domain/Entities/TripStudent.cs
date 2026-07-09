using System.ComponentModel.DataAnnotations.Schema;

namespace StudentManagement.Domain.Entities;

public class TripStudent
{
    [ForeignKey(nameof(Trip))]
    public int TripId { get; set; }

    [ForeignKey(nameof(Student))]
    public int StudentSsn { get; set; }

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public Trip Trip { get; set; } = null!;
    public Student Student { get; set; } = null!;
}