using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.DTOs.Driver;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.Infrastructure.Services;

public class DriverService : IDriverService
{
    private readonly AppDbContext _context;

    public DriverService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DriverDto>> GetAllDriversAsync()
    {
        return await _context.Drivers
            .Select(d => new DriverDto
            {
                DriverSsn = d.DriverSsn,
                FirstName = d.FirstName,
                LastName = d.LastName,
                Phone = d.Phone,
                LicenseNumber = d.LicenseNumber,
                CarModel = d.CarModel,
                CarPlate = d.CarPlate,
                CarYear = d.CarYear,
                Rating = d.Rating,
                UserId = d.UserId
            }).ToListAsync();
    }

    public async Task<DriverDto?> GetDriverBySsnAsync(int ssn)
    {
        var d = await _context.Drivers.FirstOrDefaultAsync(x => x.DriverSsn == ssn);
        if (d == null) return null;

        return new DriverDto
        {
            DriverSsn = d.DriverSsn,
            FirstName = d.FirstName,
            LastName = d.LastName,
            Phone = d.Phone,
            LicenseNumber = d.LicenseNumber,
            CarModel = d.CarModel,
            CarPlate = d.CarPlate,
            CarYear = d.CarYear,
            Rating = d.Rating,
            UserId = d.UserId
        };
    }

    public async Task<DriverDto> CreateDriverAsync(CreateDriverDto dto)
    {
        var driver = new Driver
        {
            DriverSsn = dto.DriverSsn,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Phone = dto.Phone,
            LicenseNumber = dto.LicenseNumber,
            CarModel = dto.CarModel,
            CarPlate = dto.CarPlate,
            CarYear = dto.CarYear,
            Rating = 5.00m,
            UserId = dto.UserId
        };

        _context.Drivers.Add(driver);
        await _context.SaveChangesAsync();

        return new DriverDto
        {
            DriverSsn = driver.DriverSsn,
            FirstName = driver.FirstName,
            LastName = driver.LastName,
            Phone = driver.Phone,
            LicenseNumber = driver.LicenseNumber,
            CarModel = driver.CarModel,
            CarPlate = driver.CarPlate,
            CarYear = driver.CarYear,
            Rating = driver.Rating,
            UserId = driver.UserId
        };
    }

    public async Task<bool> UpdateDriverAsync(int ssn, UpdateDriverDto dto)
    {
        var d = await _context.Drivers.FirstOrDefaultAsync(x => x.DriverSsn == ssn);
        if (d == null) return false;

        d.FirstName = dto.FirstName;
        d.LastName = dto.LastName;
        d.Phone = dto.Phone;
        d.LicenseNumber = dto.LicenseNumber;
        d.CarModel = dto.CarModel;
        d.CarPlate = dto.CarPlate;
        d.CarYear = dto.CarYear;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteDriverAsync(int ssn)
    {
        var d = await _context.Drivers.FirstOrDefaultAsync(x => x.DriverSsn == ssn);
        if (d == null) return false;

        _context.Drivers.Remove(d);
        await _context.SaveChangesAsync();
        return true;
    }
}
