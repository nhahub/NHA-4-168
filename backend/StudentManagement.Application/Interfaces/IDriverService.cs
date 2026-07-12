using System;
using System.Collections.Generic;
using System.Text;
using StudentManagement.Application.DTOs.Driver;

namespace StudentManagement.Application.Interfaces;


public interface IDriverService
{
    Task<IEnumerable<DriverDto>> GetAllDriversAsync();
    Task<DriverDto?> GetDriverBySsnAsync(int ssn);
    Task<DriverDto> CreateDriverAsync(CreateDriverDto createDriverDto);
    Task<DriverDto?> UpdateDriverAsync(int ssn, UpdateDriverDto updateDriverDto); // هنا استخدمنا الـ Update DTO
    Task<bool> DeleteDriverAsync(int ssn);
}