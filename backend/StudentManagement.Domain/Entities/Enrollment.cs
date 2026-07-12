using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentManagement.Domain.Entities;

public class Enrollment
{
    [Key]
    public int EnrollmentId { get; set; }

    [ForeignKey(nameof(Student))]
    public long StudentSsn { get; set; }

    [ForeignKey(nameof(Course))]
    public int CourseId { get; set; }

    public DateTime? EnrolledOn { get; set; }

    [MaxLength(5)]
    public string? Grade { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Active";

    public Student  Student  { get; set; } = null!;
    public Course   Course   { get; set; } = null!;
    public Payment? Payment  { get; set; }
}
