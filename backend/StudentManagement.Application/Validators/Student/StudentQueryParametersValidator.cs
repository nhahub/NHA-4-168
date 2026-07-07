using FluentValidation;
using StudentManagement.Application.DTOs.Student;

namespace StudentManagement.Application.Validators.Student;

public class StudentQueryParametersValidator : AbstractValidator<StudentQueryParameters>
{
    public StudentQueryParametersValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);

        RuleFor(x => x.Status)
            .Must(status => status is null || StudentValidationConstants.AllowedStatuses.Contains(status))
            .WithMessage("Status must be one of: Active, Inactive, Graduated, Suspended.");

        RuleFor(x => x)
            .Must(x => x.EnrollmentDateFrom is null || x.EnrollmentDateTo is null || x.EnrollmentDateFrom <= x.EnrollmentDateTo)
            .WithMessage("Enrollment date range start must be before or equal to range end.");
    }
}
