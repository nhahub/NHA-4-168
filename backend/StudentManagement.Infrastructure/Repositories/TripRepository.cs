using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.Infrastructure.Repositories;

public class TripRepository : ITripRepository
{
    private readonly AppDbContext _context;

    public TripRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Trip?> GetByIdAsync(int tripId)
    {
        return await _context.Trips.FirstOrDefaultAsync(t => t.TripId == tripId);
    }

    public async Task<Trip?> GetByIdWithDetailsAsync(int tripId)
    {
        return await _context.Trips
            .Include(t => t.Driver)
            .Include(t => t.TripStudents)
                .ThenInclude(ts => ts.Student)
            .FirstOrDefaultAsync(t => t.TripId == tripId);
    }

    public async Task<IEnumerable<Trip>> GetAllAsync()
    {
        return await _context.Trips
            .Include(t => t.Driver)
            .Include(t => t.TripStudents)
                .ThenInclude(ts => ts.Student)
            .ToListAsync();
    }

    public async Task<IEnumerable<Trip>> GetByDriverSsnAsync(long driverSsn)
    {
        return await _context.Trips
            .Include(t => t.Driver)
            .Include(t => t.TripStudents)
                .ThenInclude(ts => ts.Student)
            .Where(t => t.DriverSsn == driverSsn)
            .ToListAsync();
    }

    public async Task<IEnumerable<Trip>> GetByStudentSsnAsync(long studentSsn)
    {
        return await _context.Trips
            .Include(t => t.Driver)
            .Include(t => t.TripStudents)
                .ThenInclude(ts => ts.Student)
            .Where(t => t.TripStudents.Any(ts => ts.StudentSsn == studentSsn))
            .ToListAsync();
    }

    public async Task AddAsync(Trip trip)
    {
        await _context.Trips.AddAsync(trip);
    }

    public void Update(Trip trip)
    {
        _context.Trips.Update(trip);
    }

    public void Remove(Trip trip)
    {
        _context.Trips.Remove(trip);
    }

    public async Task<bool> DriverExistsAsync(long driverSsn)
    {
        return await _context.Drivers.AnyAsync(d => d.DriverSsn == driverSsn);
    }

    public async Task<bool> StudentExistsAsync(long studentSsn)
    {
        return await _context.Students.AnyAsync(s => s.StudentSsn == studentSsn);
    }

    public async Task<bool> IsStudentInTripAsync(int tripId, long studentSsn)
    {
        return await _context.TripStudents
            .AnyAsync(ts => ts.TripId == tripId && ts.StudentSsn == studentSsn);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}