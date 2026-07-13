using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.DTOs.Instructor;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Exceptions;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Services;

public class InstructorRatingService : IInstructorRatingService
{
    private readonly AppDbContext _context;

    public InstructorRatingService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<InstructorRatingDto> RateAsync(string studentUserId, CreateInstructorRatingDto dto)
    {
        var student = await _context.Students
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == studentUserId);

        if (student == null)
        {
            throw new NotFoundException($"Student with UserId '{studentUserId}' was not found.");
        }

        var instructorExists = await _context.Instructors
            .AsNoTracking()
            .AnyAsync(i => i.InstructorSsn == dto.InstructorSsn);

        if (!instructorExists)
        {
            throw new NotFoundException($"Instructor with SSN '{dto.InstructorSsn}' was not found.");
        }

        var isEnrolledWithInstructor = await _context.Enrollments
            .AsNoTracking()
            .AnyAsync(e => e.StudentSsn == student.StudentSsn
                           && _context.CourseInstructors.Any(ci =>
                               ci.InstructorSsn == dto.InstructorSsn && ci.CourseId == e.CourseId));

        if (!isEnrolledWithInstructor)
        {
            throw new ApiException(
                "You can only rate instructors of courses you are enrolled in.",
                403,
                "NOT_ENROLLED_WITH_INSTRUCTOR");
        }

        var existing = await _context.InstructorRatings
            .FirstOrDefaultAsync(r => r.StudentSsn == student.StudentSsn && r.InstructorSsn == dto.InstructorSsn);

        if (existing is null)
        {
            existing = new InstructorRating
            {
                StudentSsn = student.StudentSsn,
                InstructorSsn = dto.InstructorSsn
            };
            _context.InstructorRatings.Add(existing);
        }

        existing.Score = dto.Score;
        existing.Comment = string.IsNullOrWhiteSpace(dto.Comment) ? null : dto.Comment.Trim();
        existing.RatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new InstructorRatingDto
        {
            StudentSsn = existing.StudentSsn,
            InstructorSsn = existing.InstructorSsn,
            StudentName = $"{student.FirstName} {student.LastName}".Trim(),
            Score = existing.Score,
            Comment = existing.Comment,
            RatedAt = existing.RatedAt
        };
    }

    public async Task<IReadOnlyList<InstructorToRateDto>> GetEligibleInstructorsAsync(string studentUserId)
    {
        var student = await _context.Students
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == studentUserId);

        if (student == null)
        {
            return Array.Empty<InstructorToRateDto>();
        }

        var studentSsn = student.StudentSsn;

        var instructors = await _context.CourseInstructors
            .AsNoTracking()
            .Where(ci => _context.Enrollments.Any(e => e.StudentSsn == studentSsn && e.CourseId == ci.CourseId))
            .Select(ci => ci.Instructor)
            .Distinct()
            .OrderBy(i => i.LastName)
            .ThenBy(i => i.FirstName)
            .ToListAsync();

        var myRatings = await _context.InstructorRatings
            .AsNoTracking()
            .Where(r => r.StudentSsn == studentSsn)
            .ToDictionaryAsync(r => r.InstructorSsn, r => r.Score);

        return instructors
            .Select(instructor =>
            {
                var courseNames = _context.CourseInstructors
                    .AsNoTracking()
                    .Where(ci => ci.InstructorSsn == instructor.InstructorSsn
                                 && _context.Enrollments.Any(e => e.StudentSsn == studentSsn && e.CourseId == ci.CourseId))
                    .Select(ci => ci.Course.CourseName)
                    .Distinct()
                    .ToList();

                myRatings.TryGetValue(instructor.InstructorSsn, out var myScore);

                return new InstructorToRateDto
                {
                    InstructorSsn = instructor.InstructorSsn,
                    FirstName = instructor.FirstName,
                    LastName = instructor.LastName,
                    Courses = courseNames,
                    MyScore = myScore
                };
            })
            .ToList();
    }

    public async Task<IReadOnlyList<InstructorRatingDto>> GetRatingsForInstructorAsync(string instructorUserId)
    {
        var instructor = await _context.Instructors
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.UserId == instructorUserId);

        if (instructor == null)
        {
            return Array.Empty<InstructorRatingDto>();
        }

        return await _context.InstructorRatings
            .AsNoTracking()
            .Where(r => r.InstructorSsn == instructor.InstructorSsn)
            .OrderByDescending(r => r.RatedAt)
            .Select(r => new InstructorRatingDto
            {
                StudentSsn = r.StudentSsn,
                InstructorSsn = r.InstructorSsn,
                StudentName = (r.Student.FirstName + " " + r.Student.LastName).Trim(),
                Score = r.Score,
                Comment = r.Comment,
                RatedAt = r.RatedAt
            })
            .ToListAsync();
    }

    public async Task<decimal> GetAverageRatingAsync(long instructorSsn)
    {
        var average = await _context.InstructorRatings
            .AsNoTracking()
            .Where(r => r.InstructorSsn == instructorSsn)
            .Select(r => (decimal?)r.Score)
            .AverageAsync();

        return average ?? 0m;
    }

    public async Task<IReadOnlyList<InstructorRatingDto>> GetRatingsForInstructorBySsnAsync(long instructorSsn)
    {
        return await _context.InstructorRatings
            .AsNoTracking()
            .Where(r => r.InstructorSsn == instructorSsn)
            .OrderByDescending(r => r.RatedAt)
            .Select(r => new InstructorRatingDto
            {
                StudentSsn = r.StudentSsn,
                InstructorSsn = r.InstructorSsn,
                StudentName = (r.Student.FirstName + " " + r.Student.LastName).Trim(),
                Score = r.Score,
                Comment = r.Comment,
                RatedAt = r.RatedAt
            })
            .ToListAsync();
    }
}
