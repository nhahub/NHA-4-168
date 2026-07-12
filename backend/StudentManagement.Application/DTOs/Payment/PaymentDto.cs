namespace StudentManagement.Application.DTOs.Payment;

public class PaymentDto
{
	public int PaymentId { get; set; }
	public int EnrollmentId { get; set; }

	public decimal Amount { get; set; }

	public DateTime? PaymentDate { get; set; }

	public string? PaymentMethod { get; set; }

	public string Status { get; set; } = string.Empty;

	public string? TransactionId { get; set; }

	public string StudentName { get; set; } = string.Empty;

	public string CourseName { get; set; } = string.Empty;

    public int CourseId { get; set; }
}