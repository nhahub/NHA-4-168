using FluentValidation;
using StudentManagement.Application.DTOs.Course;

namespace StudentManagement.Application.Validators.Course;

public class AssignInstructorRequestValidator : AbstractValidator<AssignInstructorRequest>
{
    public AssignInstructorRequestValidator()
    {
        RuleFor(x => x.InstructorSsn)
            .GreaterThan(0);

        RuleFor(x => x.Role)
            .Must(role => role is null || CourseValidationConstants.AllowedAssignmentRoles.Contains(role))
            .WithMessage("Role must be one of: Lead, Assistant, Guest.");
    }
}
