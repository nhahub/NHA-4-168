using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Application.DTOs.Trip;

public class AddStudentToTripDto
{
    [Required]
    public long StudentSsn { get; set; }
}