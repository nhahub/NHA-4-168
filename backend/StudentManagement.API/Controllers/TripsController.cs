using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using StudentManagement.API.Services;
using StudentManagement.Application.DTOs.Trip;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Exceptions;

namespace StudentManagement.API.Controllers;

[ApiController]
[Authorize]
[Route("api/trips")]
public class TripsController : ControllerBase
{
    private readonly ITripService _tripService;
    private readonly IDriverService _driverService;
    private readonly PaymentService _paymentService;

    public TripsController(ITripService tripService, IDriverService driverService, PaymentService paymentService)
    {
        _tripService = tripService;
        _driverService = driverService;
        _paymentService = paymentService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TripDto>>> GetAll()
    {
        var trips = await _tripService.GetAllAsync();
        return Ok(trips);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TripDto?>> GetById(int id)
    {
        var trip = await _tripService.GetByIdAsync(id);
        if (trip == null) return NotFound();
        return Ok(trip);
    }

    [HttpGet("driver/{driverSsn:long}")]
    public async Task<ActionResult<IEnumerable<TripDto>>> GetByDriver(long driverSsn)
    {
        var trips = await _tripService.GetByDriverSsnAsync(driverSsn);
        return Ok(trips);
    }

    [HttpGet("student/{studentSsn:long}")]
    public async Task<ActionResult<IEnumerable<TripDto>>> GetByStudent(long studentSsn)
    {
        var trips = await _tripService.GetByStudentSsnAsync(studentSsn);
        return Ok(trips);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TripDto>> Create([FromBody] CreateTripDto dto)
    {
        var created = await _tripService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.TripId }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TripDto>> Update(int id, [FromBody] UpdateTripDto dto)
    {
        var updated = await _tripService.UpdateAsync(id, dto);
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        await _tripService.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{id:int}/students")]
    public async Task<ActionResult<TripDto>> AddStudent(int id, [FromBody] AddStudentToTripDto dto)
    {
        var updated = await _tripService.AddStudentAsync(id, dto);

        // Mirror the enrollment flow: booking a seat creates a Pending payment for
        // that student's share (this trip's price), which they then complete on
        // the payment page. Only counts toward revenue once marked "Paid".
        await _paymentService.CreatePaymentForTripAsync(id, dto.StudentSsn, updated.Price ?? 0m);

        return Ok(updated);
    }

    [HttpDelete("{id:int}/students/{studentSsn:long}")]
    public async Task<IActionResult> RemoveStudent(int id, long studentSsn)
    {
        await _tripService.RemoveStudentAsync(id, studentSsn);
        return NoContent();
    }

    [HttpPost("{id:int}/take")]
    [Authorize(Roles = "Driver")]
    public async Task<ActionResult<TripDto>> TakeTrip(int id)
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

        var updated = await _tripService.TakeTripAsync(id, driver.DriverSsn);
        return Ok(updated);
    }
}
