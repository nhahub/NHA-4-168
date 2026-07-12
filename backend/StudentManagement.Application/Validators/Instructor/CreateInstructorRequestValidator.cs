using FluentValidation;
using StudentManagement.Application.DTOs.Instructor;

namespace StudentManagement.Application.Validators.Instructor;

public class CreateInstructorRequestValidator : AbstractValidator<CreateInstructorRequest>
{
    public CreateInstructorRequestValidator()
    {
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

        RuleFor(x => x.Specialization)
            .MaximumLength(100);
    }
}
