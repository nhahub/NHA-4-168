using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Application.DTOs.Driver;

public class CreateDriverDto
{
    [Required]
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

    // الـ UserId بنخليه اختياري عشان لو الحساب هيتربط بعدين
    public string? UserId { get; set; }
}