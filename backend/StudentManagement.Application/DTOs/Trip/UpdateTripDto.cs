using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Application.DTOs.Trip;

public class UpdateTripDto
{
    [MaxLength(255)]
    public string? Destination { get; set; }

    [MaxLength(255)]
    public string? PickupArea { get; set; }

    public DateTime? EstimatedTimeOfArrival { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? Price { get; set; }

    [MaxLength(20)]
    public string? Status { get; set; }
}