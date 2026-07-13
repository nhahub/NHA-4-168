using FluentValidation;
using StudentManagement.Application.DTOs.Trip;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Exceptions;

namespace StudentManagement.Application.Services;

public class TripService : ITripService
{
    private readonly ITripRepository _tripRepository;
    private readonly IValidator<CreateTripDto> _createValidator;
    private readonly IValidator<UpdateTripDto> _updateValidator;
    private readonly IValidator<AddStudentToTripDto> _addStudentValidator;

    public TripService(
        ITripRepository tripRepository,
        IValidator<CreateTripDto> createValidator,
        IValidator<UpdateTripDto> updateValidator,
        IValidator<AddStudentToTripDto> addStudentValidator)
    {
        _tripRepository = tripRepository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _addStudentValidator = addStudentValidator;
    }

    public async Task<TripDto?> GetByIdAsync(int tripId)
    {
        var trip = await _tripRepository.GetByIdWithDetailsAsync(tripId);
        if (trip == null) return null;
        return MapToDto(trip);
    }

    public async Task<IEnumerable<TripDto>> GetAllAsync()
    {
        var trips = await _tripRepository.GetAllAsync();
        return trips.Select(MapToDto).ToList();
    }

    public async Task<IEnumerable<TripDto>> GetByDriverSsnAsync(long driverSsn)
    {
        var trips = await _tripRepository.GetByDriverSsnAsync(driverSsn);
        return trips.Select(MapToDto).ToList();
    }

    public async Task<IEnumerable<TripDto>> GetByStudentSsnAsync(long studentSsn)
    {
        var trips = await _tripRepository.GetByStudentSsnAsync(studentSsn);
        return trips.Select(MapToDto).ToList();
    }

    public async Task<TripDto> CreateAsync(CreateTripDto dto)
    {
        await ValidateAsync(_createValidator, dto);

        if (dto.DriverSsn.HasValue && !await _tripRepository.DriverExistsAsync(dto.DriverSsn.Value))
        {
            throw new NotFoundException($"Driver with SSN '{dto.DriverSsn}' was not found.");
        }

        var trip = new Trip
        {
            DriverSsn = dto.DriverSsn,
            Destination = dto.Destination.Trim(),
            PickupArea = dto.PickupArea.Trim(),
            EstimatedTimeOfArrival = dto.EstimatedTimeOfArrival,
            Price = dto.Price,
            Status = "Pending"
        };

        await _tripRepository.AddAsync(trip);
        await _tripRepository.SaveChangesAsync();

        // reload with details
        var created = await _tripRepository.GetByIdWithDetailsAsync(trip.TripId) ?? trip;
        return MapToDto(created);
    }

    public async Task<TripDto> UpdateAsync(int tripId, UpdateTripDto dto)
    {
        await ValidateAsync(_updateValidator, dto);

        var trip = await _tripRepository.GetByIdWithDetailsAsync(tripId)
            ?? throw new NotFoundException($"Trip with id '{tripId}' was not found.");

        if (dto.Destination is not null)
        {
            trip.Destination = dto.Destination.Trim();
        }

        if (dto.PickupArea is not null)
        {
            trip.PickupArea = dto.PickupArea.Trim();
        }

        if (dto.EstimatedTimeOfArrival is not null)
        {
            trip.EstimatedTimeOfArrival = dto.EstimatedTimeOfArrival;
        }

        if (dto.Price is not null)
        {
            trip.Price = dto.Price;
        }

        if (dto.Status is not null)
        {
            trip.Status = dto.Status;
        }

        _tripRepository.Update(trip);
        await _tripRepository.SaveChangesAsync();

        var updated = await _tripRepository.GetByIdWithDetailsAsync(tripId) ?? trip;
        return MapToDto(updated);
    }

    public async Task DeleteAsync(int tripId)
    {
        var trip = await _tripRepository.GetByIdAsync(tripId)
            ?? throw new NotFoundException($"Trip with id '{tripId}' was not found.");

        _tripRepository.Remove(trip);
        await _tripRepository.SaveChangesAsync();
    }

    public async Task<TripDto> AddStudentAsync(int tripId, AddStudentToTripDto dto)
    {
        await ValidateAsync(_addStudentValidator, dto);

        var trip = await _tripRepository.GetByIdWithDetailsAsync(tripId)
            ?? throw new NotFoundException($"Trip with id '{tripId}' was not found.");

        if (!await _tripRepository.StudentExistsAsync(dto.StudentSsn))
        {
            throw new NotFoundException($"Student with SSN '{dto.StudentSsn}' was not found.");
        }

        if (await _tripRepository.IsStudentInTripAsync(tripId, dto.StudentSsn))
        {
            throw new ApiException("Student is already in the trip.", 409, "STUDENT_ALREADY_IN_TRIP");
        }

        if (trip.SeatsTaken >= Trip.MaxSeats)
        {
            throw new ApiException("Trip is full.", 409, "TRIP_FULL");
        }

        var tripStudent = new TripStudent
        {
            TripId = tripId,
            StudentSsn = dto.StudentSsn,
            JoinedAt = DateTime.UtcNow
        };

        trip.TripStudents.Add(tripStudent);
        _tripRepository.Update(trip);
        await _tripRepository.SaveChangesAsync();

        var updated = await _tripRepository.GetByIdWithDetailsAsync(tripId) ?? trip;
        return MapToDto(updated);
    }

    public async Task RemoveStudentAsync(int tripId, long studentSsn)
    {
        var trip = await _tripRepository.GetByIdWithDetailsAsync(tripId)
            ?? throw new NotFoundException($"Trip with id '{tripId}' was not found.");

        var ts = trip.TripStudents.FirstOrDefault(x => x.StudentSsn == studentSsn);
        if (ts == null)
        {
            throw new NotFoundException($"Student with SSN '{studentSsn}' is not in trip '{tripId}'.");
        }

        trip.TripStudents.Remove(ts);
        _tripRepository.Update(trip);
        await _tripRepository.SaveChangesAsync();
    }

    public async Task<TripDto> TakeTripAsync(int tripId, long driverSsn)
    {
        var trip = await _tripRepository.GetByIdWithDetailsAsync(tripId)
            ?? throw new NotFoundException($"Trip with id '{tripId}' was not found.");

        if (trip.DriverSsn.HasValue)
        {
            throw new ApiException("Trip already has a driver.", 409, "TRIP_ALREADY_ASSIGNED");
        }

        if (!await _tripRepository.DriverExistsAsync(driverSsn))
        {
            throw new NotFoundException($"Driver with SSN '{driverSsn}' was not found.");
        }

        trip.DriverSsn = driverSsn;
        trip.Status = "Available";

        _tripRepository.Update(trip);
        await _tripRepository.SaveChangesAsync();

        var updated = await _tripRepository.GetByIdWithDetailsAsync(tripId) ?? trip;
        return MapToDto(updated);
    }

    private static TripDto MapToDto(Trip trip)
    {
        return new TripDto
        {
            TripId = trip.TripId,
            DriverSsn = trip.DriverSsn,
            DriverName = trip.Driver is null ? null : $"{trip.Driver.FirstName} {trip.Driver.LastName}".Trim(),
            Destination = trip.Destination,
            PickupArea = trip.PickupArea,
            EstimatedTimeOfArrival = trip.EstimatedTimeOfArrival,
            Status = trip.Status,
            Price = trip.Price,
            SeatsTaken = trip.SeatsTaken,
            MaxSeats = Trip.MaxSeats,
            Students = trip.TripStudents.Select(ts => new TripStudentDto
            {
                StudentSsn = ts.StudentSsn,
                StudentName = ts.Student is null ? null : $"{ts.Student.FirstName} {ts.Student.LastName}".Trim(),
                JoinedAt = ts.JoinedAt
            }).ToList()
        };
    }

    private static async Task ValidateAsync<T>(IValidator<T> validator, T instance)
    {
        var result = await validator.ValidateAsync(instance);
        if (result.IsValid) return;

        var errors = result.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(group => string.IsNullOrWhiteSpace(group.Key) ? "request" : group.Key,
                          group => group.Select(err => err.ErrorMessage).ToArray());

        throw new StudentManagement.Domain.Exceptions.ValidationException("Validation failed.", errors);
    }
}
