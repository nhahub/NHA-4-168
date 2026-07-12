using StudentManagement.Domain.Entities;

namespace StudentManagement.Application.Interfaces;

public interface ITripRepository
{
    Task<Trip?> GetByIdAsync(int tripId);
    Task<Trip?> GetByIdWithDetailsAsync(int tripId); // includes Driver + TripStudents + Student
    Task<IEnumerable<Trip>> GetAllAsync();
    Task<IEnumerable<Trip>> GetByDriverSsnAsync(long driverSsn);
    Task<IEnumerable<Trip>> GetByStudentSsnAsync(long studentSsn);

    Task AddAsync(Trip trip);
    void Update(Trip trip);
    void Remove(Trip trip);

    Task<bool> DriverExistsAsync(long driverSsn);
    Task<bool> StudentExistsAsync(long studentSsn);
    Task<bool> IsStudentInTripAsync(int tripId, long studentSsn);

    Task<int> SaveChangesAsync();
}