using StudentManagement.Domain.Entities;

namespace StudentManagement.Application.Interfaces;

public interface ITripRepository
{
    Task<Trip?> GetByIdAsync(int tripId);
    Task<Trip?> GetByIdWithDetailsAsync(int tripId); // includes Driver + TripStudents + Student
    Task<IEnumerable<Trip>> GetAllAsync();
    Task<IEnumerable<Trip>> GetByDriverSsnAsync(int driverSsn);
    Task<IEnumerable<Trip>> GetByStudentSsnAsync(int studentSsn);

    Task AddAsync(Trip trip);
    void Update(Trip trip);
    void Remove(Trip trip);

    Task<bool> DriverExistsAsync(int driverSsn);
    Task<bool> StudentExistsAsync(int studentSsn);
    Task<bool> IsStudentInTripAsync(int tripId, int studentSsn);

    Task<int> SaveChangesAsync();
}