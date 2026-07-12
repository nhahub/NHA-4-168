using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.DTOs.Student;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Exceptions;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.Infrastructure.Repositories;

public class StudentRepository : IStudentRepository
{
    private const int FirstGeneratedStudentSsn = 100001;
    private const int MaxCreateRetries = 5;
    private readonly AppDbContext _context;

    public StudentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IReadOnlyList<Student> Students, int TotalCount)> GetPagedAsync(StudentQueryParameters query)
    {
        var studentsQuery = _context.Students.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            studentsQuery = studentsQuery.Where(student =>
                student.FirstName.Contains(search)
                || student.LastName.Contains(search)
                || student.Email.Contains(search)
                || (student.FirstName + " " + student.LastName).Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            studentsQuery = studentsQuery.Where(student => student.Status == query.Status);
        }

        if (query.EnrollmentDateFrom is not null)
        {
            studentsQuery = studentsQuery.Where(student => student.EnrollmentDate >= query.EnrollmentDateFrom);
        }

        if (query.EnrollmentDateTo is not null)
        {
            studentsQuery = studentsQuery.Where(student => student.EnrollmentDate <= query.EnrollmentDateTo);
        }

        var totalCount = await studentsQuery.CountAsync();
        var students = await studentsQuery
            .OrderBy(student => student.LastName)
            .ThenBy(student => student.FirstName)
            .ThenBy(student => student.StudentSsn)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return (students, totalCount);
    }

    public Task<Student?> GetBySsnAsync(int ssn, bool track = false)
    {
        var query = track ? _context.Students : _context.Students.AsNoTracking();
        return query.FirstOrDefaultAsync(student => student.StudentSsn == ssn);
    }

    public Task<Student?> GetByUserIdAsync(string userId)
    {
        return _context.Students
            .AsNoTracking()
            .FirstOrDefaultAsync(student => student.UserId == userId);
    }

    public Task<Student?> GetByEmailAsync(string email)
    {
        return _context.Students
            .AsNoTracking()
            .FirstOrDefaultAsync(student => student.Email == email);
    }

    public Task<bool> EmailExistsAsync(string email, int? excludingSsn = null)
    {
        var normalizedEmail = email.Trim();

        return _context.Students
            .AsNoTracking()
            .AnyAsync(student =>
                student.Email == normalizedEmail
                && (excludingSsn == null || student.StudentSsn != excludingSsn.Value));
    }

    public async Task<Student> CreateWithGeneratedSsnAsync(Student student)
    {
        for (var attempt = 1; attempt <= MaxCreateRetries; attempt++)
        {
            student.StudentSsn = await GetNextStudentSsnAsync();

            try
            {
                _context.Students.Add(student);
                await _context.SaveChangesAsync();
                return student;
            }
            catch (DbUpdateException ex) when (IsDuplicateStudentSsnException(ex))
            {
                _context.Entry(student).State = EntityState.Detached;
                if (attempt == MaxCreateRetries)
                {
                    break;
                }
            }
        }

        throw new ApiException("Unable to allocate a unique student SSN. Please retry the request.", 409, "SSN_ALLOCATION_CONFLICT");
    }

    public Task SaveChangesAsync()
    {
        return _context.SaveChangesAsync();
    }

    private async Task<int> GetNextStudentSsnAsync()
    {
        var maxSsn = await _context.Students
            .AsNoTracking()
            .Select(student => (int?)student.StudentSsn)
            .MaxAsync();

        return maxSsn is null || maxSsn < FirstGeneratedStudentSsn
            ? FirstGeneratedStudentSsn
            : maxSsn.Value + 1;
    }

    private static bool IsDuplicateStudentSsnException(DbUpdateException exception)
    {
        if (exception.InnerException is not SqlException sqlException
            || !sqlException.Errors.Cast<SqlError>().Any(error => error.Number is 2601 or 2627))
        {
            return false;
        }

        var message = exception.ToString();
        return message.Contains("PK_Students", StringComparison.OrdinalIgnoreCase)
            || message.Contains("StudentSsn", StringComparison.OrdinalIgnoreCase);
    }
}
