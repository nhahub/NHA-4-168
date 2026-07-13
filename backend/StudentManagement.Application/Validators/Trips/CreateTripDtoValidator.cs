using FluentValidation;
using StudentManagement.Application.DTOs.Trip;

namespace StudentManagement.Application.Validators.Trip;

public class CreateTripDtoValidator : AbstractValidator<CreateTripDto>
{
    public CreateTripDtoValidator()
    {
        RuleFor(x => x.DriverSsn)
            .GreaterThan(0)
            .When(x => x.DriverSsn.HasValue)
            .WithMessage("DriverSsn must be greater than 0 if provided.");

        RuleFor(x => x.Destination)
            .NotEmpty()
            .MaximumLength(TripValidationConstants.MaxDestinationLength);

        RuleFor(x => x.PickupArea)
            .NotEmpty()
            .MaximumLength(TripValidationConstants.MaxPickupAreaLength);

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Price.HasValue);

        RuleFor(x => x.EstimatedTimeOfArrival)
            .GreaterThan(DateTime.UtcNow)
            .When(x => x.EstimatedTimeOfArrival.HasValue)
            .WithMessage("Estimated time of arrival must be in the future.");
    }
}
