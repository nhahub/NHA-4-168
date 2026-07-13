using FluentValidation;
using StudentManagement.Application.DTOs.Common;
using StudentManagement.Application.DTOs.Course;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Exceptions;

namespace StudentManagement.Application.Services;

public class CourseService : ICourseService
{
    private readonly ICourseRepository _courseRepository;
    private readonly IValidator<CreateCourseRequest> _createValidator;
    private readonly IValidator<UpdateCourseRequest> _updateValidator;
    private readonly IValidator<CourseQueryParameters> _queryValidator;
    private readonly IValidator<AssignInstructorRequest> _assignValidator;

    public CourseService(
        ICourseRepository courseRepository,
        IValidator<CreateCourseRequest> createValidator,
        IValidator<UpdateCourseRequest> updateValidator,
        IValidator<CourseQueryParameters> queryValidator,
        IValidator<AssignInstructorRequest> assignValidator)
    {
        _courseRepository = courseRepository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _queryValidator = queryValidator;
        _assignValidator = assignValidator;
    }

    public async Task<PaginatedResponse<CourseListItemDto>> GetCoursesAsync(CourseQueryParameters query)
    {
        await ValidateAsync(_queryValidator, query);

        var (courses, totalCount) = await _courseRepository.GetPagedAsync(query);

        var items = new List<CourseListItemDto>();
        foreach (var course in courses)
        {
            var enrolledCount = await _courseRepository.GetEnrolledCountAsync(course.CourseId);
            items.Add(MapToListItemDto(course, enrolledCount));
        }

        return new PaginatedResponse<CourseListItemDto>
        {
            Data = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)
        };
    }

    public async Task<CourseDto> GetCourseAsync(int courseId)
    {
        var course = await GetExistingCourseWithInstructorsAsync(courseId);
        var enrolledCount = await _courseRepository.GetEnrolledCountAsync(courseId);

        return MapToDto(course, enrolledCount);
    }

    public async Task<CourseDto> CreateCourseAsync(CreateCourseRequest request)
    {
        await ValidateAsync(_createValidator, request);

        if (await _courseRepository.NameExistsAsync(request.CourseName.Trim()))
        {
            throw new ApiException("A course with this name already exists.", 409, "DUPLICATE_COURSE_NAME");
        }

        var course = new Domain.Entities.Course
        {
            CourseName = request.CourseName.Trim(),
            Description = NormalizeOptional(request.Description),
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            MaxCapacity = request.MaxCapacity,
            Fee = request.Fee,
            Level = request.Level,
            IsPaid = request.IsPaid,
            IsActive = true
        };

        await _courseRepository.AddAsync(course);
        await _courseRepository.SaveChangesAsync();

        return MapToDto(course, enrolledCount: 0);
    }

    public async Task<CourseDto> UpdateCourseAsync(int courseId, UpdateCourseRequest request)
    {
        await ValidateAsync(_updateValidator, request);

        var course = await GetExistingCourseAsync(courseId, track: true);

        var trimmedName = request.CourseName.Trim();
        if (!string.Equals(course.CourseName, trimmedName, StringComparison.OrdinalIgnoreCase)
            && await _courseRepository.NameExistsAsync(trimmedName, courseId))
        {
            throw new ApiException("A course with this name already exists.", 409, "DUPLICATE_COURSE_NAME");
        }

        course.CourseName = trimmedName;
        course.Description = NormalizeOptional(request.Description);
        course.StartDate = request.StartDate;
        course.EndDate = request.EndDate;
        course.MaxCapacity = request.MaxCapacity;
        course.Fee = request.Fee;
        course.Level = request.Level;
        course.IsPaid = request.IsPaid;

        await _courseRepository.SaveChangesAsync();

        var enrolledCount = await _courseRepository.GetEnrolledCountAsync(courseId);
        return MapToDto(course, enrolledCount);
    }

    public async Task DeactivateCourseAsync(int courseId)
    {
        var course = await GetExistingCourseAsync(courseId, track: true);
        course.IsActive = false;

        await _courseRepository.SaveChangesAsync();
    }

    public async Task<CourseInstructorResponse> AssignInstructorAsync(int courseId, AssignInstructorRequest request)
    {
        await ValidateAsync(_assignValidator, request);

        var course = await GetExistingCourseAsync(courseId);

        if (!await _courseRepository.InstructorExistsAsync(request.InstructorSsn))
        {
            throw new NotFoundException($"Instructor with SSN '{request.InstructorSsn}' was not found.");
        }

        var existingAssignment = await _courseRepository.GetAssignmentAsync(courseId, request.InstructorSsn);
        if (existingAssignment is not null)
        {
            throw new ApiException("This instructor is already assigned to the course.", 409, "ALREADY_ASSIGNED");
        }

        var assignment = new CourseInstructor
        {
            CourseId = course.CourseId,
            InstructorSsn = request.InstructorSsn,
            Role = request.Role,
            AssignedOn = DateTime.UtcNow
        };

        await _courseRepository.AddAssignmentAsync(assignment);
        await _courseRepository.SaveChangesAsync();

        return new CourseInstructorResponse
        {
            CourseId = assignment.CourseId,
            InstructorSsn = assignment.InstructorSsn,
            Role = assignment.Role,
            AssignedOn = assignment.AssignedOn
        };
    }

    public async Task RemoveInstructorAsync(int courseId, long instructorSsn)
    {
        await GetExistingCourseAsync(courseId);

        var assignment = await _courseRepository.GetAssignmentAsync(courseId, instructorSsn)
            ?? throw new NotFoundException("This instructor is not assigned to the course.");

        _courseRepository.RemoveAssignment(assignment);
        await _courseRepository.SaveChangesAsync();
    }

    private async Task<Domain.Entities.Course> GetExistingCourseAsync(int courseId, bool track = false)
    {
        return await _courseRepository.GetByIdAsync(courseId, track)
            ?? throw new NotFoundException($"Course with id '{courseId}' was not found.");
    }

    private async Task<Domain.Entities.Course> GetExistingCourseWithInstructorsAsync(int courseId)
    {
        return await _courseRepository.GetByIdWithInstructorsAsync(courseId)
            ?? throw new NotFoundException($"Course with id '{courseId}' was not found.");
    }

    private static async Task ValidateAsync<T>(IValidator<T> validator, T instance)
    {
        var result = await validator.ValidateAsync(instance);
        if (result.IsValid)
        {
            return;
        }

        var errors = result.Errors
            .GroupBy(error => error.PropertyName)
            .ToDictionary(
                group => string.IsNullOrWhiteSpace(group.Key) ? "request" : group.Key,
                group => group.Select(error => error.ErrorMessage).ToArray());

        throw new StudentManagement.Domain.Exceptions.ValidationException("Validation failed.", errors);
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static int? CalculateAvailableSeats(Domain.Entities.Course course, int enrolledCount)
    {
        return course.MaxCapacity is null ? null : Math.Max(course.MaxCapacity.Value - enrolledCount, 0);
    }

    private static CourseListItemDto MapToListItemDto(Domain.Entities.Course course, int enrolledCount)
    {
        return new CourseListItemDto
        {
            CourseId = course.CourseId,
            CourseName = course.CourseName,
            Level = course.Level,
            Fee = course.Fee,
            IsPaid = course.IsPaid,
            StartDate = course.StartDate,
            EndDate = course.EndDate,
            MaxCapacity = course.MaxCapacity,
            EnrolledCount = enrolledCount,
            AvailableSeats = CalculateAvailableSeats(course, enrolledCount),
            IsActive = course.IsActive
        };
    }

    private static CourseDto MapToDto(Domain.Entities.Course course, int enrolledCount)
    {
        return new CourseDto
        {
            CourseId = course.CourseId,
            CourseName = course.CourseName,
            Description = course.Description,
            Level = course.Level,
            Fee = course.Fee,
            IsPaid = course.IsPaid,
            StartDate = course.StartDate,
            EndDate = course.EndDate,
            MaxCapacity = course.MaxCapacity,
            EnrolledCount = enrolledCount,
            AvailableSeats = CalculateAvailableSeats(course, enrolledCount),
            IsActive = course.IsActive,
            Instructors = course.CourseInstructors
                .Select(ci => new CourseInstructorSummaryDto
                {
                    InstructorSsn = ci.InstructorSsn,
                    FullName = $"{ci.Instructor.FirstName} {ci.Instructor.LastName}".Trim(),
                    Role = ci.Role,
                    AssignedOn = ci.AssignedOn
                })
                .ToList()
        };
    }
}
