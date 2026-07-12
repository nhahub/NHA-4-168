using StudentManagement.Application.DTOs.Common;
using StudentManagement.Application.DTOs.Course;

namespace StudentManagement.Application.Interfaces;

public interface ICourseService
{
    Task<PaginatedResponse<CourseListItemDto>> GetCoursesAsync(CourseQueryParameters query);
    Task<CourseDto> GetCourseAsync(int courseId);
    Task<CourseDto> CreateCourseAsync(CreateCourseRequest request);
    Task<CourseDto> UpdateCourseAsync(int courseId, UpdateCourseRequest request);
    Task DeactivateCourseAsync(int courseId);
    Task<CourseInstructorResponse> AssignInstructorAsync(int courseId, AssignInstructorRequest request);
    Task RemoveInstructorAsync(int courseId, long instructorSsn);
}
