using StudentManagement.Application.DTOs.Enrollment;

namespace StudentManagement.Application.Interfaces;

public interface IEnrollmentService
{
    Task<IEnumerable<EnrollmentDto>> GetAllAsync();

    Task<EnrollmentDto?> GetByIdAsync(int id);

    Task<EnrollmentDto> CreateAsync(CreateEnrollmentDto dto);

    Task<bool> UpdateStatusAsync(int id, UpdateEnrollmentStatusDto dto);
}