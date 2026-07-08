namespace StudentManagement.Application.DTOs.Trip;

public class TripDto
{
    public int TripId { get; set; }

    public int DriverSsn { get; set; }
    public string? DriverName { get; set; }

    public string Destination { get; set; } = string.Empty;
    public string PickupArea { get; set; } = string.Empty;
    public DateTime? EstimatedTimeOfArrival { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? Price { get; set; }

    public int SeatsTaken { get; set; }
    public int MaxSeats { get; set; } = 14;

    public List<TripStudentDto> Students { get; set; } = new();
}

public class TripStudentDto
{
    public int StudentSsn { get; set; }
    public string? StudentName { get; set; }
    public DateTime JoinedAt { get; set; }
}