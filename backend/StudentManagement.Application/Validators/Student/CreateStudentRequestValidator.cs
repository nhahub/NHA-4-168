using FluentValidation;
using StudentManagement.Application.DTOs.Student;

namespace StudentManagement.Application.Validators.Student;

public class CreateStudentRequestValidator : AbstractValidator<CreateStudentRequest>
{
    public static readonly string[] AllowedStatuses = { "Active", "Inactive", "Graduated", "Suspended" };

    public CreateStudentRequestValidator()
    {
        RuleFor(x => x.StudentSsn)
            .GreaterThan(0)
            .When(x => x.StudentSsn.HasValue)
            .WithMessage("StudentSsn must be greater than 0 if provided.");

        RuleFor(x => x.FirstName)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.LastName)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(100);

        RuleFor(x => x.Phone)
            .MaximumLength(20);

        RuleFor(x => x.Address)
            .MaximumLength(255);

        RuleFor(x => x.Status)
            .Must(status => AllowedStatuses.Contains(status))
            .When(x => !string.IsNullOrWhiteSpace(x.Status))
            .WithMessage($"Status must be one of: {string.Join(", ", AllowedStatuses)}");
    }
}
