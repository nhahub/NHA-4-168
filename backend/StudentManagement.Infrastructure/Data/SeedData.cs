using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace StudentManagement.Infrastructure.Data;

public static class SeedData
{
    private static readonly string[] Roles = ["Admin", "Student", "Driver", "Instructor"];

    /// <summary>
    /// Ensures the fixed application roles exist. Safe to call on every startup.
    /// </summary>
    public static async Task SeedRolesAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        foreach (var roleName in Roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }
    }
}
