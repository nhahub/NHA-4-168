using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Application.DTOs.Trip;

public class CreateTripDto
{
    [Required]
    public int DriverSsn { get; set; }

    [Required, MaxLength(255)]
    public string Destination { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string PickupArea { get; set; } = string.Empty;

    public DateTime? EstimatedTimeOfArrival { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? Price { get; set; }
}