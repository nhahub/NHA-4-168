namespace StudentManagement.Application.DTOs.Payment;

public class CreatePaymentDto
{
	public int? EnrollmentId { get; set; }

	public int? TripId { get; set; }

	public long? StudentSsn { get; set; }

	public decimal Amount { get; set; }

	public string PaymentMethod { get; set; } = string.Empty;
}
