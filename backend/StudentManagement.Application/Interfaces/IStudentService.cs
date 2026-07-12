using StudentManagement.Application.DTOs.Common;
using StudentManagement.Application.DTOs.Student;

namespace StudentManagement.Application.Interfaces;

public interface IStudentService
{
    Task<PaginatedResponse<StudentListItemDto>> GetStudentsAsync(StudentQueryParameters query);
    Task<StudentDto> GetStudentAsync(long ssn, string? userId, IEnumerable<string> roles);
    Task<StudentDto> CreateStudentAsync(CreateStudentRequest request);
    Task<StudentDto> UpdateStudentAsync(long ssn, UpdateStudentRequest request, string? userId, IEnumerable<string> roles);
    Task<StudentStatusResponse> UpdateStudentStatusAsync(long ssn, UpdateStudentStatusRequest request);
    Task<StudentDto> GetCurrentStudentAsync(string userId);
}

public class StudentStatusResponse
{
    public long StudentSsn { get; set; }
    public string Status { get; set; } = string.Empty;
}
