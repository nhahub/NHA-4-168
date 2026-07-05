using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using StudentManagement.Application.DTOs.Auth;
using StudentManagement.Domain.Entities;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Services;

public class AuthService
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(
        UserManager<IdentityUser> userManager,
        RoleManager<IdentityRole> roleManager,
        AppDbContext context,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponse> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return new LoginResponse
            {
                Success = false,
                Message = "A user with this email already exists."
            };
        }

        var identityUser = new IdentityUser
        {
            UserName = request.Email,
            Email = request.Email
        };

        var createResult = await _userManager.CreateAsync(identityUser, request.Password);
        if (!createResult.Succeeded)
        {
            return new LoginResponse
            {
                Success = false,
                Message = string.Join("; ", createResult.Errors.Select(e => e.Description))
            };
        }

        // Ensure the default role exists, then assign it.
        const string defaultRole = "Student";
        if (!await _roleManager.RoleExistsAsync(defaultRole))
        {
            await _roleManager.CreateAsync(new IdentityRole(defaultRole));
        }
        await _userManager.AddToRoleAsync(identityUser, defaultRole);

        // Create the linked domain record.
        var student = new Student
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Status = "Active",
            EnrollmentDate = DateTime.UtcNow,
            UserId = identityUser.Id
        };

        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        var token = await GenerateJwtTokenAsync(identityUser);

        return new LoginResponse
        {
            Success = true,
            Message = "Registration successful.",
            Data = new LoginResponseData
            {
                Token = token,
                User = new UserDto
                {
                    Id = identityUser.Id,
                    Email = identityUser.Email!,
                    FirstName = student.FirstName,
                    LastName = student.LastName,
                    Roles = [defaultRole]
                }
            }
        };
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return new LoginResponse
            {
                Success = false,
                Message = "Invalid email or password."
            };
        }

        var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid)
        {
            return new LoginResponse
            {
                Success = false,
                Message = "Invalid email or password."
            };
        }

        var roles = await _userManager.GetRolesAsync(user);

        // Best-effort lookup of first/last name from linked domain records.
        var student = _context.Students.FirstOrDefault(s => s.UserId == user.Id);
        var instructor = student == null
            ? _context.Instructors.FirstOrDefault(i => i.UserId == user.Id)
            : null;
        var driver = student == null && instructor == null
            ? _context.Drivers.FirstOrDefault(d => d.UserId == user.Id)
            : null;

        var firstName = student?.FirstName ?? instructor?.FirstName ?? driver?.FirstName;
        var lastName = student?.LastName ?? instructor?.LastName ?? driver?.LastName;

        var token = await GenerateJwtTokenAsync(user);

        return new LoginResponse
        {
            Success = true,
            Message = "Login successful.",
            Data = new LoginResponseData
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email!,
                    FirstName = firstName,
                    LastName = lastName,
                    Roles = roles.ToList()
                }
            }
        };
    }

    private async Task<string> GenerateJwtTokenAsync(IdentityUser user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "your-super-secret-key-min-32-chars");

        var roles = await _userManager.GetRolesAsync(user);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

        var expirationMinutes = double.TryParse(jwtSettings["ExpirationMinutes"], out var minutes) ? minutes : 60;

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
