using StudentManagement.Application.DTOs.Common;
using StudentManagement.Application.DTOs.Instructor;

namespace StudentManagement.Application.Interfaces;

public interface IInstructorService
{
    Task<PaginatedResponse<InstructorListItemDto>> GetInstructorsAsync(InstructorQueryParameters query);
    Task<InstructorDto> GetInstructorAsync(long ssn, string? userId, IEnumerable<string> roles);
    Task<InstructorDto> CreateInstructorAsync(CreateInstructorRequest request);
    Task<InstructorDto> UpdateInstructorAsync(long ssn, UpdateInstructorRequest request);
}
