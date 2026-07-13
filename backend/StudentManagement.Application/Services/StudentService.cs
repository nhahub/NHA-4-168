using FluentValidation;
using StudentManagement.Application.DTOs.Common;
using StudentManagement.Application.DTOs.Student;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Exceptions;

namespace StudentManagement.Application.Services;

public class StudentService : IStudentService
{
    private readonly IStudentRepository _studentRepository;
    private readonly IValidator<CreateStudentRequest> _createValidator;
    private readonly IValidator<UpdateStudentRequest> _updateValidator;
    private readonly IValidator<UpdateStudentStatusRequest> _statusValidator;
    private readonly IValidator<StudentQueryParameters> _queryValidator;

    public StudentService(
        IStudentRepository studentRepository,
        IValidator<CreateStudentRequest> createValidator,
        IValidator<UpdateStudentRequest> updateValidator,
        IValidator<UpdateStudentStatusRequest> statusValidator,
        IValidator<StudentQueryParameters> queryValidator)
    {
        _studentRepository = studentRepository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _statusValidator = statusValidator;
        _queryValidator = queryValidator;
    }

    public async Task<PaginatedResponse<StudentListItemDto>> GetStudentsAsync(StudentQueryParameters query)
    {
        await ValidateAsync(_queryValidator, query);

        var (students, totalCount) = await _studentRepository.GetPagedAsync(query);

        return new PaginatedResponse<StudentListItemDto>
        {
            Data = students.Select(MapToListItemDto).ToList(),
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)
        };
    }

    public async Task<StudentDto> GetStudentAsync(long ssn, string? userId, IEnumerable<string> roles)
    {
        var student = await GetExistingStudentAsync(ssn);
        EnsureCanAccessStudent(student, userId, roles);

        return MapToDto(student);
    }

    public async Task<StudentDto> GetCurrentStudentAsync(string userId)
    {
        var student = await _studentRepository.GetByUserIdAsync(userId)
            ?? throw new NotFoundException("Student not found.");

        return MapToDto(student);
    }

    public async Task<StudentDto> CreateStudentAsync(CreateStudentRequest request)
    {
        await ValidateAsync(_createValidator, request);

        if (await _studentRepository.EmailExistsAsync(request.Email))
        {
            throw new ApiException("A student with this email already exists.", 409, "DUPLICATE_EMAIL");
        }

        var student = new Student
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim(),
            Phone = NormalizeOptional(request.Phone),
            DateOfBirth = request.DateOfBirth,
            Address = NormalizeOptional(request.Address),
            EnrollmentDate = request.EnrollmentDate ?? DateTime.UtcNow,
            Status = string.IsNullOrWhiteSpace(request.Status) ? "Active" : request.Status.Trim()
        };

        Student created;

        if (request.StudentSsn.HasValue)
        {
            if (await _studentRepository.SsnExistsAsync(request.StudentSsn.Value))
            {
                throw new ApiException($"A student with SSN '{request.StudentSsn}' already exists.", 409, "DUPLICATE_SSN");
            }

            student.StudentSsn = request.StudentSsn.Value;
            created = await _studentRepository.CreateAsync(student);
        }
        else
        {
            created = await _studentRepository.CreateWithGeneratedSsnAsync(student);
        }

        return MapToDto(created);
    }

    public async Task<StudentDto> UpdateStudentAsync(long ssn, UpdateStudentRequest request, string? userId, IEnumerable<string> roles)
    {
        await ValidateAsync(_updateValidator, request);

        var student = await GetExistingStudentAsync(ssn, track: true);
        var isAdmin = IsAdmin(roles);
        var isOwner = IsLinkedStudent(student, userId);

        if (!isAdmin && !isOwner)
        {
            throw new ApiException("You are not allowed to update this student.", 403, "FORBIDDEN");
        }

        if (isAdmin)
        {
            if (request.FirstName is not null)
            {
                student.FirstName = request.FirstName.Trim();
            }

            if (request.LastName is not null)
            {
                student.LastName = request.LastName.Trim();
            }

            if (request.Email is not null)
            {
                var email = request.Email.Trim();
                if (!string.Equals(student.Email, email, StringComparison.OrdinalIgnoreCase)
                    && await _studentRepository.EmailExistsAsync(email, ssn))
                {
                    throw new ApiException("A student with this email already exists.", 409, "DUPLICATE_EMAIL");
                }

                student.Email = email;
            }

            if (request.EnrollmentDate is not null)
            {
                student.EnrollmentDate = request.EnrollmentDate;
            }
        }

        if (request.Phone is not null)
        {
            student.Phone = NormalizeOptional(request.Phone);
        }

        if (request.DateOfBirth is not null)
        {
            student.DateOfBirth = request.DateOfBirth;
        }

        if (request.Address is not null)
        {
            student.Address = NormalizeOptional(request.Address);
        }

        await _studentRepository.SaveChangesAsync();
        return MapToDto(student);
    }

    public async Task<StudentStatusResponse> UpdateStudentStatusAsync(long ssn, UpdateStudentStatusRequest request)
    {
        await ValidateAsync(_statusValidator, request);

        var student = await GetExistingStudentAsync(ssn, track: true);
        student.Status = request.Status;

        await _studentRepository.SaveChangesAsync();

        return new StudentStatusResponse
        {
            StudentSsn = student.StudentSsn,
            Status = student.Status
        };
    }

    private async Task<Student> GetExistingStudentAsync(long ssn, bool track = false)
    {
        return await _studentRepository.GetBySsnAsync(ssn, track)
            ?? throw new NotFoundException($"Student with SSN '{ssn}' was not found.");
    }

    private static void EnsureCanAccessStudent(Student student, string? userId, IEnumerable<string> roles)
    {
        if (IsAdmin(roles) || IsLinkedStudent(student, userId))
        {
            return;
        }

        throw new ApiException("You are not allowed to access this student.", 403, "FORBIDDEN");
    }

    private static bool IsAdmin(IEnumerable<string> roles)
    {
        return roles.Any(role => string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase));
    }

    private static bool IsLinkedStudent(Student student, string? userId)
    {
        return !string.IsNullOrWhiteSpace(userId)
            && !string.IsNullOrWhiteSpace(student.UserId)
            && string.Equals(student.UserId, userId, StringComparison.Ordinal);
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

    private static StudentDto MapToDto(Student student)
    {
        return new StudentDto
        {
            StudentSsn = student.StudentSsn,
            FirstName = student.FirstName,
            LastName = student.LastName,
            Email = student.Email,
            Phone = student.Phone,
            DateOfBirth = student.DateOfBirth,
            Address = student.Address,
            EnrollmentDate = student.EnrollmentDate,
            Status = student.Status
        };
    }

    private static StudentListItemDto MapToListItemDto(Student student)
    {
        return new StudentListItemDto
        {
            StudentSsn = student.StudentSsn,
            FirstName = student.FirstName,
            LastName = student.LastName,
            Email = student.Email,
            Phone = student.Phone,
            Status = student.Status,
            EnrollmentDate = student.EnrollmentDate
        };
    }
}
