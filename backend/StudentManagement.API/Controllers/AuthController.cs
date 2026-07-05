using Microsoft.AspNetCore.Mvc;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { success = false, message = "Email and password are required." });
        }

        // Accept any credentials for local testing, or check if it matches design parameters
        return Ok(new
        {
            success = true,
            message = "Login successful.",
            data = new
            {
                token = "mock-jwt-token-for-development-purposes-only",
                user = new
                {
                    id = "1001",
                    email = request.Email,
                    roles = new[] { "Admin" },
                    role = "Admin",
                    fullName = "Alex Morgan"
                }
            }
        });
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] object request)
    {
        return Ok(new
        {
            success = true,
            message = "Registration successful."
        });
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
