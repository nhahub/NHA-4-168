using StudentManagement.Application.DTOs.Instructor;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Application.Interfaces;

public interface IInstructorRepository
{
    Task<(IReadOnlyList<Instructor> Instructors, int TotalCount)> GetPagedAsync(InstructorQueryParameters query);
    Task<Instructor?> GetBySsnAsync(long ssn, bool track = false);
    Task<Instructor?> GetBySsnWithCoursesAsync(long ssn);
    Task<bool> EmailExistsAsync(string email, long? excludingSsn = null);
    Task<Instructor> CreateWithGeneratedSsnAsync(Instructor instructor);
    Task SaveChangesAsync();
}
