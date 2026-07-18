using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentManagement.Domain.Entities;

public class Payment
{
    [Key]
    public int PaymentId { get; set; }

    // Nullable now: a payment can originate from a course Enrollment OR a Trip booking, not necessarily both.
    [ForeignKey(nameof(Enrollment))]
    public int? EnrollmentId { get; set; }

    [ForeignKey(nameof(Trip))]
    public int? TripId { get; set; }

    // Needed for trip payments: a Trip can carry multiple students, so we must
    // record which student this specific payment belongs to. For enrollment
    // payments this is left null (the Enrollment already identifies the student).
    public long? StudentSsn { get; set; }

    public decimal Amount { get; set; }

    public DateTime? PaymentDate { get; set; }

    [MaxLength(50)]
    public string? PaymentMethod { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Pending";

    [MaxLength(100)]
    public string? TransactionId { get; set; }

    public Enrollment? Enrollment { get; set; }
    public Trip? Trip { get; set; }
    public Student? Student { get; set; }
}
