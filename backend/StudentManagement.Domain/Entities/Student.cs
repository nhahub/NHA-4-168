using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace StudentManagement.Domain.Entities;

public class Student
{
    [Key]
    public long StudentSsn { get; set; }

    [MaxLength(50)]
    public string? FirstName { get; set; }

    [MaxLength(50)]
    public string? LastName { get; set; }

    [Required, MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    public DateTime? DateOfBirth { get; set; }

    [MaxLength(255)]
    public string? Address { get; set; }

    public DateTime? EnrollmentDate { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Active";

    [ForeignKey(nameof(User))]
    public string? UserId { get; set; }

    public ICollection<Enrollment>     Enrollments     { get; set; } = new List<Enrollment>();
    public ICollection<StudentService> StudentServices { get; set; } = new List<StudentService>();
    public IdentityUser? User { get; set; }
}
