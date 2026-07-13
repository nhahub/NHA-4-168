using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.DTOs.Course;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.Infrastructure.Repositories;

public class CourseRepository : ICourseRepository
{
    private readonly AppDbContext _context;

    public CourseRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IReadOnlyList<Course> Courses, int TotalCount)> GetPagedAsync(CourseQueryParameters query)
    {
        var coursesQuery = _context.Courses.AsNoTracking().Where(course => course.IsActive);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            coursesQuery = coursesQuery.Where(course =>
                course.CourseName.Contains(search)
                || (course.Description != null && course.Description.Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(query.Level))
        {
            coursesQuery = coursesQuery.Where(course => course.Level == query.Level);
        }

        if (query.IsPaid is not null)
        {
            coursesQuery = coursesQuery.Where(course => course.IsPaid == query.IsPaid);
        }

        if (query.StartDateFrom is not null)
        {
            coursesQuery = coursesQuery.Where(course => course.StartDate >= query.StartDateFrom);
        }

        if (query.HasCapacity == true)
        {
            coursesQuery = coursesQuery.Where(course =>
                course.MaxCapacity == null
                || course.Enrollments.Count(e => e.Status == "Active") < course.MaxCapacity);
        }

        var totalCount = await coursesQuery.CountAsync();
        var courses = await coursesQuery
            .OrderBy(course => course.CourseName)
            .ThenBy(course => course.CourseId)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return (courses, totalCount);
    }

    public Task<Course?> GetByIdAsync(int courseId, bool track = false)
    {
        var query = track ? _context.Courses : _context.Courses.AsNoTracking();
        return query.FirstOrDefaultAsync(course => course.CourseId == courseId);
    }

    public Task<Course?> GetByIdWithInstructorsAsync(int courseId)
    {
        return _context.Courses
            .AsNoTracking()
            .Include(course => course.CourseInstructors)
                .ThenInclude(ci => ci.Instructor)
            .FirstOrDefaultAsync(course => course.CourseId == courseId);
    }

    public Task<bool> NameExistsAsync(string courseName, int? excludingCourseId = null)
    {
        return _context.Courses
            .AsNoTracking()
            .AnyAsync(course =>
                course.CourseName == courseName
                && (excludingCourseId == null || course.CourseId != excludingCourseId.Value));
    }

    public Task<int> GetEnrolledCountAsync(int courseId)
    {
        return _context.Enrollments
            .AsNoTracking()
            .CountAsync(enrollment => enrollment.CourseId == courseId && enrollment.Status == "Active");
    }

    public async Task AddAsync(Course course)
    {
        await _context.Courses.AddAsync(course);
    }

    public Task<bool> InstructorExistsAsync(long instructorSsn)
    {
        return _context.Instructors.AnyAsync(instructor => instructor.InstructorSsn == instructorSsn);
    }

    public Task<CourseInstructor?> GetAssignmentAsync(int courseId, long instructorSsn)
    {
        return _context.CourseInstructors
            .FirstOrDefaultAsync(ci => ci.CourseId == courseId && ci.InstructorSsn == instructorSsn);
    }

    public async Task AddAssignmentAsync(CourseInstructor courseInstructor)
    {
        await _context.CourseInstructors.AddAsync(courseInstructor);
    }

    public void RemoveAssignment(CourseInstructor courseInstructor)
    {
        _context.CourseInstructors.Remove(courseInstructor);
    }

    public Task SaveChangesAsync()
    {
        return _context.SaveChangesAsync();
    }
}
