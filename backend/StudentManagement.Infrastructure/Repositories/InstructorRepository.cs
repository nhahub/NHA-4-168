using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.DTOs.Instructor;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Exceptions;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.Infrastructure.Repositories;

public class InstructorRepository : IInstructorRepository
{
    private const int FirstGeneratedInstructorSsn = 2001;
    private const int MaxCreateRetries = 5;
    private readonly AppDbContext _context;

    public InstructorRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IReadOnlyList<Instructor> Instructors, int TotalCount)> GetPagedAsync(InstructorQueryParameters query)
    {
        var instructorsQuery = _context.Instructors.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            instructorsQuery = instructorsQuery.Where(instructor =>
                instructor.FirstName.Contains(search)
                || instructor.LastName.Contains(search)
                || (instructor.Specialization != null && instructor.Specialization.Contains(search))
                || (instructor.FirstName + " " + instructor.LastName).Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(query.Specialization))
        {
            instructorsQuery = instructorsQuery.Where(instructor => instructor.Specialization == query.Specialization);
        }

        var totalCount = await instructorsQuery.CountAsync();
        var instructors = await instructorsQuery
            .OrderBy(instructor => instructor.LastName)
            .ThenBy(instructor => instructor.FirstName)
            .ThenBy(instructor => instructor.InstructorSsn)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return (instructors, totalCount);
    }

    public Task<Instructor?> GetBySsnAsync(int ssn, bool track = false)
    {
        var query = track ? _context.Instructors : _context.Instructors.AsNoTracking();
        return query.FirstOrDefaultAsync(instructor => instructor.InstructorSsn == ssn);
    }

    public Task<Instructor?> GetBySsnWithCoursesAsync(int ssn)
    {
        return _context.Instructors
            .AsNoTracking()
            .Include(instructor => instructor.CourseInstructors)
                .ThenInclude(ci => ci.Course)
            .FirstOrDefaultAsync(instructor => instructor.InstructorSsn == ssn);
    }

    public Task<bool> EmailExistsAsync(string email, int? excludingSsn = null)
    {
        var normalizedEmail = email.Trim();

        return _context.Instructors
            .AsNoTracking()
            .AnyAsync(instructor =>
                instructor.Email == normalizedEmail
                && (excludingSsn == null || instructor.InstructorSsn != excludingSsn.Value));
    }

    public async Task<Instructor> CreateWithGeneratedSsnAsync(Instructor instructor)
    {
        for (var attempt = 1; attempt <= MaxCreateRetries; attempt++)
        {
            instructor.InstructorSsn = await GetNextInstructorSsnAsync();

            try
            {
                _context.Instructors.Add(instructor);
                await _context.SaveChangesAsync();
                return instructor;
            }
            catch (DbUpdateException ex) when (IsDuplicateInstructorSsnException(ex))
            {
                _context.Entry(instructor).State = EntityState.Detached;
                if (attempt == MaxCreateRetries)
                {
                    break;
                }
            }
        }

        throw new ApiException("Unable to allocate a unique instructor SSN. Please retry the request.", 409, "SSN_ALLOCATION_CONFLICT");
    }

    public Task SaveChangesAsync()
    {
        return _context.SaveChangesAsync();
    }

    private async Task<int> GetNextInstructorSsnAsync()
    {
        var maxSsn = await _context.Instructors
            .AsNoTracking()
            .Select(instructor => (int?)instructor.InstructorSsn)
            .MaxAsync();

        return maxSsn is null || maxSsn < FirstGeneratedInstructorSsn
            ? FirstGeneratedInstructorSsn
            : maxSsn.Value + 1;
    }

    private static bool IsDuplicateInstructorSsnException(DbUpdateException exception)
    {
        if (exception.InnerException is not SqlException sqlException
            || !sqlException.Errors.Cast<SqlError>().Any(error => error.Number is 2601 or 2627))
        {
            return false;
        }

        var message = exception.ToString();
        return message.Contains("PK_Instructors", StringComparison.OrdinalIgnoreCase)
            || message.Contains("InstructorSsn", StringComparison.OrdinalIgnoreCase);
    }
}
