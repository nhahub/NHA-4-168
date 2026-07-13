using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Services;
using StudentManagement.Application.DTOs.Payment;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentController : ControllerBase
{
    private readonly PaymentService _service;

    public PaymentController(PaymentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreatePaymentDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return Ok(result);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdatePaymentStatusDto dto)
    {
        var updated = await _service.UpdateStatusAsync(id, dto);

        if (!updated)
            return NotFound();

        return NoContent();
    }
    [HttpGet("student/{studentSsn}")]
    public async Task<ActionResult<IReadOnlyList<PaymentDto>>> GetStudentPayments(long studentSsn)
    {
        var result = await _service.GetStudentPaymentsAsync(studentSsn);
        return Ok(result);
    }

    [HttpGet("enrollment/{enrollmentId:int}")]
    public async Task<ActionResult<PaymentDto>> GetByEnrollment(int enrollmentId)
    {
        var result = await _service.GetByEnrollmentAsync(enrollmentId);

        if (result == null)
            return NotFound();

        return Ok(result);
    }
}