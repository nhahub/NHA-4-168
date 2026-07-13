using FluentValidation;
using StudentManagement.Application.DTOs.Instructor;

namespace StudentManagement.Application.Validators.Instructor;

public class CreateInstructorRatingDtoValidator : AbstractValidator<CreateInstructorRatingDto>
{
    public CreateInstructorRatingDtoValidator()
    {
        RuleFor(x => x.InstructorSsn)
            .GreaterThan(0)
            .WithMessage("InstructorSsn is required and must be greater than 0.");

        RuleFor(x => x.Score)
            .InclusiveBetween(1m, 5m)
            .WithMessage("Score must be between 1 and 5.");

        RuleFor(x => x.Comment)
            .MaximumLength(1000);
    }
}
