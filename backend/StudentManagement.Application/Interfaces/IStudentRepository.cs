using StudentManagement.Application.DTOs.Student;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Application.Interfaces;

public interface IStudentRepository
{
    Task<(IReadOnlyList<Student> Students, int TotalCount)> GetPagedAsync(StudentQueryParameters query);
    Task<Student?> GetBySsnAsync(long ssn, bool track = false);
    Task<Student?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email, long? excludingSsn = null);
    Task<bool> SsnExistsAsync(long ssn);
    Task<Student> CreateAsync(Student student);
    Task<Student> CreateWithGeneratedSsnAsync(Student student);
    Task SaveChangesAsync();
    Task<Student?> GetByUserIdAsync(string userId);
}
