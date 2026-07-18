namespace StudentManagement.Application.DTOs.Payment;

public class PaymentDto
{
	public int PaymentId { get; set; }
	public int? EnrollmentId { get; set; }
	public int? TripId { get; set; }

	public decimal Amount { get; set; }

	public DateTime? PaymentDate { get; set; }

	public string? PaymentMethod { get; set; }

	public string Status { get; set; } = string.Empty;

	public string? TransactionId { get; set; }

	public string StudentName { get; set; } = string.Empty;

	// Populated when this payment came from a course Enrollment; null for trip payments.
	public string? CourseName { get; set; }
	public int? CourseId { get; set; }

	// Populated when this payment came from a Trip booking; null for course payments.
	public string? TripDestination { get; set; }
	public string? TripPickupArea { get; set; }

	// "Course" or "Trip" — lets the frontend render the right label/columns without guessing.
	public string PaymentType { get; set; } = string.Empty;
}
