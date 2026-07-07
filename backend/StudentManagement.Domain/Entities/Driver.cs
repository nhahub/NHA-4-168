using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace StudentManagement.Domain.Entities;

public class Driver
{
    [Key]
    public int DriverSsn { get; set; }

    [Required, MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string LicenseNumber { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? CarModel { get; set; }

    [MaxLength(20)]
    public string? CarPlate { get; set; }

    public int? CarYear { get; set; }

    public decimal? Rating { get; set; }

    [ForeignKey(nameof(User))]
    public string? UserId { get; set; }

    public ICollection<RideBooking> RideBookings { get; set; } = [];
    public IdentityUser? User { get; set; }
}
