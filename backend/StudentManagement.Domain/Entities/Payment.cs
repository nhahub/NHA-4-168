namespace StudentManagement.Domain.Entities;

public class Payment
{
    public int       PaymentId     { get; set; }
    public int       EnrollmentId  { get; set; }
    public decimal   Amount        { get; set; }
    public DateTime? PaymentDate   { get; set; }
    public string?   PaymentMethod { get; set; }
    public string    Status        { get; set; } = "Pending";
    public string?   TransactionId { get; set; }

    public Enrollment Enrollment { get; set; } = null!;
}
