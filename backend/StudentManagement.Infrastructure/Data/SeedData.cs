using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace StudentManagement.Infrastructure.Data;

public static class SeedData
{
    private static readonly string[] Roles = ["Admin", "Student", "Driver", "Instructor"];

    /// <summary>
    /// Ensures the fixed application roles exist. Safe to call on every startup.
    /// Call as: await app.Services.SeedRolesAsync();
    /// </summary>
    public static async Task SeedRolesAsync(this IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
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
