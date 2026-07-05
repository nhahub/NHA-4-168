using Microsoft.AspNetCore.Identity;

namespace StudentManagement.Domain.Entities;

public class Driver
{
    public int      DriverSsn     { get; set; }
    public string   FirstName     { get; set; } = string.Empty;
    public string   LastName      { get; set; } = string.Empty;
    public string   Phone         { get; set; } = string.Empty;
    public string   LicenseNumber { get; set; } = string.Empty;
    public string?  CarModel      { get; set; }
    public string?  CarPlate      { get; set; }
    public int?     CarYear       { get; set; }
    public decimal? Rating        { get; set; }
    public string?  UserId        { get; set; }

    public ICollection<RideBooking> RideBookings { get; set; } = [];
    public IdentityUser? User { get; set; }
}
