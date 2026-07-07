using StudentManagement.Application.DTOs.Student;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Application.Interfaces;

public interface IStudentRepository
{
    Task<(IReadOnlyList<Student> Students, int TotalCount)> GetPagedAsync(StudentQueryParameters query);
    Task<Student?> GetBySsnAsync(int ssn, bool track = false);
    Task<Student?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email, int? excludingSsn = null);
    Task<Student> CreateWithGeneratedSsnAsync(Student student);
    Task SaveChangesAsync();
}
