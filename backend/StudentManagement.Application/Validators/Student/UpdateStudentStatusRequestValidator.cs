using FluentValidation;
using StudentManagement.Application.DTOs.Student;

namespace StudentManagement.Application.Validators.Student;

public class UpdateStudentStatusRequestValidator : AbstractValidator<UpdateStudentStatusRequest>
{
    public UpdateStudentStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(status => StudentValidationConstants.AllowedStatuses.Contains(status))
            .WithMessage("Status must be one of: Active, Inactive, Graduated, Suspended.");
    }
}
