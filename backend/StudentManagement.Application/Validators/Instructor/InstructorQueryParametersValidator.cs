using FluentValidation;
using StudentManagement.Application.DTOs.Instructor;

namespace StudentManagement.Application.Validators.Instructor;

public class InstructorQueryParametersValidator : AbstractValidator<InstructorQueryParameters>
{
    public InstructorQueryParametersValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);
    }
}
