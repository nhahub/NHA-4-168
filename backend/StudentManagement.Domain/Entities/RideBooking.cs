namespace StudentManagement.Domain.Entities;

public class RideBooking
{
    public int       BookingId       { get; set; }
    public int       StudentSsn      { get; set; }
    public int       DriverSsn       { get; set; }
    public DateTime? BookingDate     { get; set; }
    public string    PickupLocation  { get; set; } = string.Empty;
    public string    DropoffLocation { get; set; } = string.Empty;
    public string    Status          { get; set; } = "Pending";
    public decimal?  Fare            { get; set; }

    public Student Student { get; set; } = null!;
    public Driver  Driver  { get; set; } = null!;
}
