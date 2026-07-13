using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using StudentManagement.Application.DTOs.Driver;
using StudentManagement.Application.Interfaces; // من الخريطة بتاعتك

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")] // الـ Route هيكون: api/drivers
public class DriversController : ControllerBase
{
    private readonly IDriverService _driverService;

    public DriversController(IDriverService driverService)
    {
        _driverService = driverService;
    }

    // 1️⃣ GET: api/drivers
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var drivers = await _driverService.GetAllDriversAsync();
        return Ok(drivers);
    }

    // 2️⃣ GET: api/drivers/{ssn}
    [HttpGet("{ssn}")]
    public async Task<IActionResult> GetBySsn(long ssn)
    {
        var driver = await _driverService.GetDriverBySsnAsync(ssn);
        if (driver == null)
        {
            return NotFound(new { message = $"Driver with SSN {ssn} was not found." });
        }
        return Ok(driver);
    }

    // 3️⃣ POST: api/drivers
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDriverDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var createdDriver = await _driverService.CreateDriverAsync(dto);
        return CreatedAtAction(nameof(GetBySsn), new { ssn = createdDriver.DriverSsn }, createdDriver);
    }

    // 4️⃣ PUT: api/drivers/{ssn}
    [HttpPut("{ssn}")]
    public async Task<IActionResult> Update(long ssn, [FromBody] UpdateDriverDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var updatedDriver = await _driverService.UpdateDriverAsync(ssn, dto);
        if (updatedDriver == null)
        {
            return NotFound(new { message = $"Driver with SSN {ssn} was not found." });
        }
        return Ok(updatedDriver);
    }

    // 5️⃣ DELETE: api/drivers/{ssn}
    [HttpDelete("{ssn}")]
    public async Task<IActionResult> Delete(long ssn)
    {
        var success = await _driverService.DeleteDriverAsync(ssn);
        if (!success)
        {
            return NotFound(new { message = $"Driver with SSN {ssn} was not found." });
        }
        return NoContent();
    }

    // 6️⃣ GET: api/drivers/me
    [HttpGet("me")]
    [Authorize(Roles = "Driver")]
    public async Task<IActionResult> GetCurrentDriver()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var driver = await _driverService.GetCurrentDriverAsync(userId);
        if (driver == null)
        {
            return NotFound(new { message = "Driver profile not found for current user." });
        }

        return Ok(driver);
    }
}
