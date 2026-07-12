using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentManagement.Domain.Entities;

public class Trip
{
    [Key]
    public int TripId { get; set; }

    [ForeignKey(nameof(Driver))]
    public long DriverSsn { get; set; }

    public DateTime? EstimatedTimeOfArrival { get; set; }

    [Required, MaxLength(255)]
    public string Destination { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string PickupArea { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Pending";

    [Column(TypeName = "decimal(10,2)")]
    public decimal? Price { get; set; }

    public Driver Driver { get; set; } = null!;

    public ICollection<TripStudent> TripStudents { get; set; } = new List<TripStudent>();

    public const int MaxSeats = 14;

    [NotMapped]
    public int SeatsTaken => TripStudents?.Count ?? 0;
}