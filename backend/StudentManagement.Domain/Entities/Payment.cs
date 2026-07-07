using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentManagement.Domain.Entities;

public class Payment
{
    [Key]
    public int PaymentId { get; set; }

    [ForeignKey(nameof(Enrollment))]
    public int EnrollmentId { get; set; }

    public decimal Amount { get; set; }

    public DateTime? PaymentDate { get; set; }

    [MaxLength(50)]
    public string? PaymentMethod { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Pending";

    [MaxLength(100)]
    public string? TransactionId { get; set; }

    public Enrollment Enrollment { get; set; } = null!;
}
