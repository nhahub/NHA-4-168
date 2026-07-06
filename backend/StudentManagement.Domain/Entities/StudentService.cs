using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentManagement.Domain.Entities;

public class StudentService
{
    [Key]
    public int StudentServiceId { get; set; }

    [ForeignKey(nameof(Student))]
    public int StudentSsn { get; set; }

    [ForeignKey(nameof(Service))]
    public int ServiceId { get; set; }

    public DateTime? RequestedDate { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Pending";

    public Student Student { get; set; } = null!;
    public Service Service { get; set; } = null!;
}
