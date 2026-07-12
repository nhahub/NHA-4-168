using StudentManagement.Application.DTOs.Instructor;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Application.Interfaces;

public interface IInstructorRepository
{
    Task<(IReadOnlyList<Instructor> Instructors, int TotalCount)> GetPagedAsync(InstructorQueryParameters query);
    Task<Instructor?> GetBySsnAsync(int ssn, bool track = false);
    Task<Instructor?> GetBySsnWithCoursesAsync(int ssn);
    Task<bool> EmailExistsAsync(string email, int? excludingSsn = null);
    Task<Instructor> CreateWithGeneratedSsnAsync(Instructor instructor);
    Task SaveChangesAsync();
}
