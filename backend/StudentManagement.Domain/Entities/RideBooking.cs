using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentManagement.Domain.Entities;

public class RideBooking
{
    [Key]
    public int BookingId { get; set; }

    [ForeignKey(nameof(Student))]
    public int StudentSsn { get; set; }

    [ForeignKey(nameof(Driver))]
    public int DriverSsn { get; set; }

    public DateTime? BookingDate { get; set; }

    [Required, MaxLength(255)]
    public string PickupLocation { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string DropoffLocation { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Pending";

    [Column(TypeName = "decimal(10,2)")]
    public decimal? Fare { get; set; }

    public Student Student { get; set; } = null!;
    public Driver  Driver  { get; set; } = null!;
}
