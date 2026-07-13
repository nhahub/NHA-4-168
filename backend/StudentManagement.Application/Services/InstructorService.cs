using FluentValidation;
using StudentManagement.Application.DTOs.Common;
using StudentManagement.Application.DTOs.Instructor;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Exceptions;

namespace StudentManagement.Application.Services;

public class InstructorService : IInstructorService
{
    private readonly IInstructorRepository _instructorRepository;
    private readonly IValidator<CreateInstructorRequest> _createValidator;
    private readonly IValidator<UpdateInstructorRequest> _updateValidator;
    private readonly IValidator<InstructorQueryParameters> _queryValidator;

    public InstructorService(
        IInstructorRepository instructorRepository,
        IValidator<CreateInstructorRequest> createValidator,
        IValidator<UpdateInstructorRequest> updateValidator,
        IValidator<InstructorQueryParameters> queryValidator)
    {
        _instructorRepository = instructorRepository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _queryValidator = queryValidator;
    }

    public async Task<PaginatedResponse<InstructorListItemDto>> GetInstructorsAsync(InstructorQueryParameters query)
    {
        await ValidateAsync(_queryValidator, query);

        var (instructors, totalCount) = await _instructorRepository.GetPagedAsync(query);

        return new PaginatedResponse<InstructorListItemDto>
        {
            Data = instructors.Select(MapToListItemDto).ToList(),
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)
        };
    }

    public async Task<InstructorDto> GetInstructorAsync(long ssn, string? userId, IEnumerable<string> roles)
    {
        var instructor = await _instructorRepository.GetBySsnWithCoursesAsync(ssn)
            ?? throw new NotFoundException($"Instructor with SSN '{ssn}' was not found.");

        var isAdmin = roles.Any(role => string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase));
        var isOwner = !string.IsNullOrWhiteSpace(userId)
            && !string.IsNullOrWhiteSpace(instructor.UserId)
            && string.Equals(instructor.UserId, userId, StringComparison.Ordinal);

        if (!isAdmin && !isOwner)
        {
            throw new ApiException("You are not allowed to access this instructor.", 403, "FORBIDDEN");
        }

        return MapToDto(instructor);
    }

    public async Task<InstructorDto> CreateInstructorAsync(CreateInstructorRequest request)
    {
        await ValidateAsync(_createValidator, request);

        if (await _instructorRepository.EmailExistsAsync(request.Email.Trim()))
        {
            throw new ApiException("An instructor with this email already exists.", 409, "DUPLICATE_EMAIL");
        }

        var instructor = new Domain.Entities.Instructor
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Phone = NormalizeOptional(request.Phone),
            Email = request.Email.Trim(),
            Specialization = NormalizeOptional(request.Specialization),
            CommissionRate = request.CommissionRate,
            HireDate = request.HireDate ?? DateTime.UtcNow
        };

        var created = await _instructorRepository.CreateWithGeneratedSsnAsync(instructor);
        return MapToDto(created);
    }

    public async Task<InstructorDto> UpdateInstructorAsync(long ssn, UpdateInstructorRequest request)
    {
        await ValidateAsync(_updateValidator, request);

        var instructor = await _instructorRepository.GetBySsnAsync(ssn, track: true)
            ?? throw new NotFoundException($"Instructor with SSN '{ssn}' was not found.");

        var trimmedEmail = request.Email.Trim();
        if (!string.Equals(instructor.Email, trimmedEmail, StringComparison.OrdinalIgnoreCase)
            && await _instructorRepository.EmailExistsAsync(trimmedEmail, ssn))
        {
            throw new ApiException("An instructor with this email already exists.", 409, "DUPLICATE_EMAIL");
        }

        instructor.FirstName = request.FirstName.Trim();
        instructor.LastName = request.LastName.Trim();
        instructor.Phone = NormalizeOptional(request.Phone);
        instructor.Email = trimmedEmail;
        instructor.Specialization = NormalizeOptional(request.Specialization);
        instructor.CommissionRate = request.CommissionRate;
        instructor.HireDate = request.HireDate;

        await _instructorRepository.SaveChangesAsync();

        return MapToDto(instructor);
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

    private static InstructorListItemDto MapToListItemDto(Domain.Entities.Instructor instructor)
    {
        return new InstructorListItemDto
        {
            InstructorSsn = instructor.InstructorSsn,
            FirstName = instructor.FirstName,
            LastName = instructor.LastName,
            Email = instructor.Email,
            Phone = instructor.Phone,
            Specialization = instructor.Specialization,
            Rating = instructor.Rating,
            CommissionRate = instructor.CommissionRate,
            HireDate = instructor.HireDate
        };
    }

    private static InstructorDto MapToDto(Domain.Entities.Instructor instructor)
    {
        return new InstructorDto
        {
            InstructorSsn = instructor.InstructorSsn,
            FirstName = instructor.FirstName,
            LastName = instructor.LastName,
            Phone = instructor.Phone,
            Email = instructor.Email,
            Specialization = instructor.Specialization,
            HireDate = instructor.HireDate,
            Rating = instructor.Rating,
            Courses = instructor.CourseInstructors
                .Select(ci => new InstructorCourseSummaryDto
                {
                    CourseId = ci.CourseId,
                    CourseName = ci.Course.CourseName,
                    Role = ci.Role
                })
                .ToList()
        };
    }
}
