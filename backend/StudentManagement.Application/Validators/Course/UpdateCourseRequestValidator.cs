using FluentValidation;
using StudentManagement.Application.DTOs.Course;

namespace StudentManagement.Application.Validators.Course;

public class UpdateCourseRequestValidator : AbstractValidator<UpdateCourseRequest>
{
    public UpdateCourseRequestValidator()
    {
        RuleFor(x => x.CourseName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Description)
            .MaximumLength(4000);

        RuleFor(x => x.Level)
            .Must(level => level is null || CourseValidationConstants.AllowedLevels.Contains(level))
            .WithMessage("Level must be one of: Beginner, Intermediate, Advanced.");

        RuleFor(x => x.MaxCapacity)
            .GreaterThan(0)
            .When(x => x.MaxCapacity is not null);

        RuleFor(x => x.Fee)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Fee is not null);

        RuleFor(x => x)
            .Must(x => x.StartDate is null || x.EndDate is null || x.StartDate <= x.EndDate)
            .WithMessage("Start date must be before or equal to end date.");

        RuleFor(x => x)
            .Must(x => !x.IsPaid || x.Fee is not null)
            .WithMessage("Fee is required for paid courses.");
    }
}
