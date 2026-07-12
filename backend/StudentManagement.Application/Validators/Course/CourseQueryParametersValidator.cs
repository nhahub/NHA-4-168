using FluentValidation;
using StudentManagement.Application.DTOs.Course;

namespace StudentManagement.Application.Validators.Course;

public class CourseQueryParametersValidator : AbstractValidator<CourseQueryParameters>
{
    public CourseQueryParametersValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);

        RuleFor(x => x.Level)
            .Must(level => level is null || CourseValidationConstants.AllowedLevels.Contains(level))
            .WithMessage("Level must be one of: Beginner, Intermediate, Advanced.");
    }
}
