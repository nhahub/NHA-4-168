using FluentValidation;
using StudentManagement.Application.DTOs.Student;

namespace StudentManagement.Application.Validators.Student;

public class UpdateStudentRequestValidator : AbstractValidator<UpdateStudentRequest>
{
    public static readonly string[] AllowedStatuses = { "Active", "Inactive", "Graduated", "Suspended" };

    public UpdateStudentRequestValidator()
    {
        RuleFor(x => x)
            .Must(HasAtLeastOneField)
            .WithMessage("At least one editable field is required.");

        RuleFor(x => x.FirstName)
            .MaximumLength(50)
            .When(x => x.FirstName is not null);

        RuleFor(x => x.LastName)
            .MaximumLength(50)
            .When(x => x.LastName is not null);

        RuleFor(x => x.Email)
            .EmailAddress()
            .MaximumLength(100)
            .When(x => x.Email is not null);

        RuleFor(x => x.Phone)
            .MaximumLength(20)
            .When(x => x.Phone is not null);

        RuleFor(x => x.Address)
            .MaximumLength(255)
            .When(x => x.Address is not null);

        RuleFor(x => x.Status)
            .Must(status => AllowedStatuses.Contains(status))
            .When(x => x.Status is not null)
            .WithMessage($"Status must be one of: {string.Join(", ", AllowedStatuses)}");
    }

    private static bool HasAtLeastOneField(UpdateStudentRequest request)
    {
        return request.FirstName is not null
            || request.LastName is not null
            || request.Email is not null
            || request.Phone is not null
            || request.DateOfBirth is not null
            || request.Address is not null
            || request.EnrollmentDate is not null
            || request.Status is not null;
    }
}
