using StudentManagement.Application.DTOs.Trip;

namespace StudentManagement.Application.Interfaces;

public interface ITripService
{
    Task<TripDto?> GetByIdAsync(int tripId);
    Task<IEnumerable<TripDto>> GetAllAsync();
    Task<IEnumerable<TripDto>> GetByDriverSsnAsync(int driverSsn);
    Task<IEnumerable<TripDto>> GetByStudentSsnAsync(int studentSsn);

    Task<TripDto> CreateAsync(CreateTripDto dto);
    Task<TripDto> UpdateAsync(int tripId, UpdateTripDto dto);
    Task DeleteAsync(int tripId);

    Task<TripDto> AddStudentAsync(int tripId, AddStudentToTripDto dto);
    Task RemoveStudentAsync(int tripId, int studentSsn);
}