namespace StudentManagement.Application.DTOs.Driver;

public class DriverDto
{
    public long DriverSsn { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string? CarModel { get; set; }
    public string? CarPlate { get; set; }
    public int? CarYear { get; set; }
    public decimal? Rating { get; set; } // عشان يعرض التقييم الحالي للسواق
    public string? UserId { get; set; }
    public string Status { get; set; } = string.Empty;
}