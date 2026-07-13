namespace StudentManagement.Application.Validators.Trip;

public static class TripValidationConstants
{
    public const int MaxDestinationLength = 255;
    public const int MaxPickupAreaLength = 255;
    public const int MaxStatusLength = 20;
    public const int MaxSeats = 14;

    public static readonly string[] AllowedStatuses =
        { "Pending", "Available", "Full", "InProgress", "Completed", "Cancelled" };
}