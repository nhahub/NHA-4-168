using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data;

public static class SeedTestData
{
    /// <summary>
    /// Seeds sample students, instructors, drivers, courses, and services for local
    /// development/testing. Safe to call on every startup — each block checks for
    /// existing data before inserting.
    /// Call as: await app.Services.SeedTestDataAsync();
    /// </summary>
    public static async Task SeedTestDataAsync(this IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;

        var context = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<IdentityUser>>();

        await SeedStudentsAsync(context, userManager);
        await SeedInstructorsAsync(context, userManager);
        await SeedDriversAsync(context, userManager);
        await SeedCoursesAsync(context);
        await SeedServicesAsync(context);
        await GetOrCreateUserAsync(userManager, "admin@studentmanagement.example.com", "Admin", "Admin@12345");
    }

    private static async Task<IdentityUser> GetOrCreateUserAsync(
        UserManager<IdentityUser> userManager, string email, string role, string password = "Passw0rd!")
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user != null)
        {
            return user;
        }

        user = new IdentityUser { UserName = email, Email = email, EmailConfirmed = true };
        var result = await userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                $"Failed to seed user '{email}': {string.Join("; ", result.Errors.Select(e => e.Description))}");
        }

        await userManager.AddToRoleAsync(user, role);
        return user;
    }

    private static async Task SeedStudentsAsync(AppDbContext context, UserManager<IdentityUser> userManager)
    {
        if (await context.Students.AnyAsync())
        {
            return;
        }

        var seedStudents = new (string FirstName, string LastName, string Email)[]
        {
            ("Amr", "Khaled", "amr.khaled@student.example.com"),
            ("Layla", "Hassan", "layla.hassan@student.example.com"),
            ("Omar", "Mostafa", "omar.mostafa@student.example.com"),
            ("Sara", "Adel", "sara.adel@student.example.com"),
            ("Youssef", "Ibrahim", "youssef.ibrahim@student.example.com"),
            ("Nour", "Farouk", "nour.farouk@student.example.com"),
            ("Karim", "Salem", "karim.salem@student.example.com"),
            ("Mona", "Fathy", "mona.fathy@student.example.com"),
        };

        var nextSsn = 100001;
        foreach (var (firstName, lastName, email) in seedStudents)
        {
            var user = await GetOrCreateUserAsync(userManager, email, "Student");

            context.Students.Add(new Student
            {
                StudentSsn = nextSsn++,
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                Status = "Active",
                EnrollmentDate = DateTime.UtcNow.AddMonths(-Random.Shared.Next(1, 12)),
                UserId = user.Id
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedInstructorsAsync(AppDbContext context, UserManager<IdentityUser> userManager)
    {
        if (await context.Instructors.AnyAsync())
        {
            return;
        }

        var seedInstructors = new (string FirstName, string LastName, string Email, string Specialization)[]
        {
            ("Hassan", "Nabil", "hassan.nabil@instructor.example.com", "Software Engineering"),
            ("Rania", "Tarek", "rania.tarek@instructor.example.com", "Data Science"),
            ("Sherif", "Gamal", "sherif.gamal@instructor.example.com", "Mobile Development"),
            ("Dina", "Wahid", "dina.wahid@instructor.example.com", "UI/UX Design"),
        };

        var nextSsn = 200001;
        foreach (var (firstName, lastName, email, specialization) in seedInstructors)
        {
            var user = await GetOrCreateUserAsync(userManager, email, "Instructor");

            context.Instructors.Add(new Instructor
            {
                InstructorSsn = nextSsn++,
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                Specialization = specialization,
                HireDate = DateTime.UtcNow.AddYears(-Random.Shared.Next(1, 8)),
                Rating = Math.Round((decimal)(Random.Shared.NextDouble() * 2 + 3), 2), // 3.00–5.00
                UserId = user.Id
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedDriversAsync(AppDbContext context, UserManager<IdentityUser> userManager)
    {
        if (await context.Drivers.AnyAsync())
        {
            return;
        }

        var seedDrivers = new (string FirstName, string LastName, string Email, string License, string CarModel, string CarPlate, int CarYear)[]
        {
            ("Mahmoud", "Ezzat", "mahmoud.ezzat@driver.example.com", "LIC-10234", "Toyota Corolla", "ABC-1234", 2021),
            ("Heba", "Younes", "heba.younes@driver.example.com", "LIC-10589", "Hyundai Elantra", "XYZ-5678", 2022),
        };

        var nextSsn = 300001;
        foreach (var (firstName, lastName, email, license, carModel, carPlate, carYear) in seedDrivers)
        {
            var user = await GetOrCreateUserAsync(userManager, email, "Driver");

            context.Drivers.Add(new Driver
            {
                DriverSsn = nextSsn++,
                FirstName = firstName,
                LastName = lastName,
                Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
                LicenseNumber = license,
                CarModel = carModel,
                CarPlate = carPlate,
                CarYear = carYear,
                Rating = Math.Round((decimal)(Random.Shared.NextDouble() * 1.5 + 3.5), 2), // 3.50–5.00
                UserId = user.Id
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedCoursesAsync(AppDbContext context)
    {
        if (await context.Courses.AnyAsync())
        {
            return;
        }

        var seedCourses = new (string Name, string Description, int Capacity, decimal Fee, string Level, bool IsPaid)[]
        {
            ("Intro to Programming", "Fundamentals of programming using C#.", 30, 0m, "Beginner", false),
            ("Web Development Bootcamp", "Full-stack web development with React and .NET.", 25, 1200m, "Intermediate", true),
            ("Data Structures & Algorithms", "Core CS concepts for technical interviews.", 20, 800m, "Advanced", true),
            ("Mobile App Development", "Building cross-platform apps with Flutter.", 20, 900m, "Intermediate", true),
            ("UI/UX Design Foundations", "Principles of user-centered design.", 25, 0m, "Beginner", false),
        };

        foreach (var (name, description, capacity, fee, level, isPaid) in seedCourses)
        {
            context.Courses.Add(new Course
            {
                CourseName = name,
                Description = description,
                StartDate = DateTime.UtcNow.AddDays(7),
                EndDate = DateTime.UtcNow.AddMonths(3),
                MaxCapacity = capacity,
                Fee = fee,
                Level = level,
                IsPaid = isPaid
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedServicesAsync(AppDbContext context)
    {
        if (await context.Services.AnyAsync())
        {
            return;
        }

        var seedServices = new (string Name, string Description, TimeOnly Start, TimeOnly End, string Days, string Location)[]
        {
            ("Academic Advising", "One-on-one guidance on course selection and career paths.", new TimeOnly(9, 0), new TimeOnly(17, 0), "Mon,Tue,Wed,Thu,Fri", "Building A, Room 204"),
            ("IT Helpdesk", "Technical support for student accounts and devices.", new TimeOnly(8, 0), new TimeOnly(20, 0), "Mon,Tue,Wed,Thu,Fri,Sat", "Building B, Ground Floor"),
        };

        foreach (var (name, description, start, end, days, location) in seedServices)
        {
            context.Services.Add(new Service
            {
                ServiceName = name,
                Description = description,
                StartTime = start,
                EndTime = end,
                WorkingDays = days,
                Location = location
            });
        }

        await context.SaveChangesAsync();
    }
}
