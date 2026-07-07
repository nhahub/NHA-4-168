using StudentManagement.Application.DTOs.Common;
using StudentManagement.Application.DTOs.Student;

namespace StudentManagement.Application.Interfaces;

public interface IStudentService
{
    Task<PaginatedResponse<StudentListItemDto>> GetStudentsAsync(StudentQueryParameters query);
    Task<StudentDto> GetStudentAsync(int ssn, string? userId, IEnumerable<string> roles);
    Task<StudentDto> CreateStudentAsync(CreateStudentRequest request);
    Task<StudentDto> UpdateStudentAsync(int ssn, UpdateStudentRequest request, string? userId, IEnumerable<string> roles);
    Task<StudentStatusResponse> UpdateStudentStatusAsync(int ssn, UpdateStudentStatusRequest request);
}

public class StudentStatusResponse
{
    public int StudentSsn { get; set; }
    public string Status { get; set; } = string.Empty;
}
