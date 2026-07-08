using Microsoft.AspNetCore.Mvc;
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
    public async Task<IActionResult> GetBySsn(int ssn)
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
    public async Task<IActionResult> Update(int ssn, [FromBody] UpdateDriverDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var success = await _driverService.UpdateDriverAsync(ssn, dto);
        if (!success)
        {
            return NotFound(new { message = $"Driver with SSN {ssn} was not found." });
        }
        return NoContent();
    }

    // 5️⃣ DELETE: api/drivers/{ssn}
    [HttpDelete("{ssn}")]
    public async Task<IActionResult> Delete(int ssn)
    {
        var success = await _driverService.DeleteDriverAsync(ssn);
        if (!success)
        {
            return NotFound(new { message = $"Driver with SSN {ssn} was not found." });
        }
        return NoContent();
    }
}