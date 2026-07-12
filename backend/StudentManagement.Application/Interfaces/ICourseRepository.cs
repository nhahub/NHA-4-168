using StudentManagement.Application.DTOs.Course;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Application.Interfaces;

public interface ICourseRepository
{
    Task<(IReadOnlyList<Course> Courses, int TotalCount)> GetPagedAsync(CourseQueryParameters query);
    Task<Course?> GetByIdAsync(int courseId, bool track = false);
    Task<Course?> GetByIdWithInstructorsAsync(int courseId);
    Task<bool> NameExistsAsync(string courseName, int? excludingCourseId = null);
    Task<int> GetEnrolledCountAsync(int courseId);
    Task AddAsync(Course course);
    Task<bool> InstructorExistsAsync(long instructorSsn);
    Task<CourseInstructor?> GetAssignmentAsync(int courseId, long instructorSsn);
    Task AddAssignmentAsync(CourseInstructor courseInstructor);
    void RemoveAssignment(CourseInstructor courseInstructor);
    Task SaveChangesAsync();
}
