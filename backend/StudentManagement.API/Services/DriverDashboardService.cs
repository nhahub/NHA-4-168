using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.DTOs.Dashboard;
using StudentManagement.Application.DTOs.Trip;
using StudentManagement.Application.Interfaces;
using Microsoft.Extensions.Logging;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Services;

public class DriverDashboardService : IDriverDashboardService
{
    private readonly AppDbContext _context;
    private readonly ILogger<DriverDashboardService> _logger;

    public DriverDashboardService(AppDbContext context, ILogger<DriverDashboardService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<DriverDashboardSummaryDto> GetSummaryAsync(string userId)
    {
        var driver = await _context.Drivers
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.UserId == userId);

        if (driver == null)
        {
            _logger.LogWarning("Driver with UserId {UserId} not found.", userId);
            return new DriverDashboardSummaryDto();
        }

        var totalTrips = await _context.Trips
            .AsNoTracking()
            .CountAsync(t => t.DriverSsn == driver.DriverSsn);

        var completedTrips = await _context.Trips
            .AsNoTracking()
            .CountAsync(t => t.DriverSsn == driver.DriverSsn && t.Status == "Completed");

        var activeStatuses = new[] { "Pending", "Available", "InProgress" };
        var activeTrips = await _context.Trips
            .AsNoTracking()
            .CountAsync(t => t.DriverSsn == driver.DriverSsn && activeStatuses.Contains(t.Status));

        return new DriverDashboardSummaryDto
        {
            TotalTrips = totalTrips,
            CompletedTrips = completedTrips,
            ActiveTrips = activeTrips
        };
    }

    public async Task<IEnumerable<TripDto>> GetTripsAsync(string userId)
    {
        var driver = await _context.Drivers
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.UserId == userId);

        if (driver == null) return Enumerable.Empty<TripDto>();

        return await _context.Trips
            .AsNoTracking()
            .Include(t => t.TripStudents)
                .ThenInclude(ts => ts.Student)
            .Where(t => t.DriverSsn == driver.DriverSsn)
            .Select(trip => new TripDto
            {
                TripId = trip.TripId,
                DriverSsn = trip.DriverSsn,
                DriverName = (driver.FirstName + " " + driver.LastName).Trim(),
                Destination = trip.Destination,
                PickupArea = trip.PickupArea,
                EstimatedTimeOfArrival = trip.EstimatedTimeOfArrival,
                Status = trip.Status,
                Price = trip.Price,
                MaxSeats = StudentManagement.Domain.Entities.Trip.MaxSeats,
                SeatsTaken = trip.TripStudents.Count,
                Students = trip.TripStudents.Select(ts => new TripStudentDto
                {
                    StudentSsn = ts.StudentSsn,
                    StudentName = ts.Student != null ? (ts.Student.FirstName + " " + ts.Student.LastName).Trim() : string.Empty,
                    JoinedAt = ts.JoinedAt
                }).ToList()
            })
            .ToListAsync();
    }

    public async Task<IReadOnlyList<ActivityLogDto>> GetRecentActivitiesAsync(string userId, int limit)
    {
        var driver = await _context.Drivers
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.UserId == userId);

        if (driver == null) return new List<ActivityLogDto>();

        var maxLimit = limit <= 0 ? int.MaxValue : limit;

        var passengerActivities = await _context.TripStudents
            .AsNoTracking()
            .Include(ts => ts.Student)
            .Include(ts => ts.Trip)
            .Where(ts => ts.Trip.DriverSsn == driver.DriverSsn)
            .OrderByDescending(ts => ts.JoinedAt)
            .Take(maxLimit)
            .Select(ts => new
            {
                StudentName = ts.Student.FirstName + " " + ts.Student.LastName,
                ts.Trip.Destination,
                OccurredAt = ts.JoinedAt
            })
            .ToListAsync();

        return passengerActivities
            .Select(activity => new ActivityLogDto
            {
                Title = $"{activity.StudentName} booked a ride on your trip to {activity.Destination}",
                OccurredAt = activity.OccurredAt,
                Tone = "info",
                Icon = "BusFront"
            })
            .OrderByDescending(activity => activity.OccurredAt)
            .Take(maxLimit)
            .ToList();
    }
}
