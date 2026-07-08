using FluentValidation;
using StudentManagement.Application.DTOs.Trip;

namespace StudentManagement.Application.Validators.Trip;

public class UpdateTripDtoValidator : AbstractValidator<UpdateTripDto>
{
    public UpdateTripDtoValidator()
    {
        RuleFor(x => x.Destination)
            .MaximumLength(TripValidationConstants.MaxDestinationLength)
            .When(x => x.Destination != null);

        RuleFor(x => x.PickupArea)
            .MaximumLength(TripValidationConstants.MaxPickupAreaLength)
            .When(x => x.PickupArea != null);

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Price.HasValue);

        RuleFor(x => x.Status)
            .Must(s => TripValidationConstants.AllowedStatuses.Contains(s))
            .When(x => x.Status != null)
            .WithMessage($"Status must be one of: {string.Join(", ", TripValidationConstants.AllowedStatuses)}");
    }
}