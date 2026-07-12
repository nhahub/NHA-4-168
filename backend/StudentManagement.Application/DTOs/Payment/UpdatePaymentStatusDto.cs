namespace StudentManagement.Application.DTOs.Payment;

public class UpdatePaymentStatusDto
{
    public string Status { get; set; } = string.Empty;

    public string? TransactionId { get; set; }
}