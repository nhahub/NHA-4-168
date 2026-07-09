using FluentValidation;
using StudentManagement.Application.DTOs.Trip;

namespace StudentManagement.Application.Validators.Trip;

public class AddStudentToTripDtoValidator : AbstractValidator<AddStudentToTripDto>
{
    public AddStudentToTripDtoValidator()
    {
        RuleFor(x => x.StudentSsn)
            .GreaterThan(0).WithMessage("StudentSsn is required.");
    }
}