using StudentManagement.Application.DTOs.Payment;

namespace StudentManagement.Application.Interfaces;

public interface IPaymentService
{
    Task<IEnumerable<PaymentDto>> GetAllAsync();

    Task<PaymentDto?> GetByIdAsync(int id);

    Task<PaymentDto> CreateAsync(CreatePaymentDto dto);

    Task<bool> UpdateStatusAsync(int id, UpdatePaymentStatusDto dto);
}