using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using FluentValidation;
using StudentManagement.API.Middleware;
using StudentManagement.API.Services;
using StudentManagement.Application.DTOs.Student;
using StudentManagement.Application.Interfaces;
using StudentManagement.Application.Services;
using StudentManagement.Application.Validators.Student;
using StudentManagement.Application.DTOs.Course;
using StudentManagement.Application.Validators.Course;
using StudentManagement.Application.DTOs.Instructor;
using StudentManagement.Application.Validators.Instructor;
using StudentManagement.Infrastructure.Data;
using StudentManagement.Infrastructure.Repositories;
using StudentManagement.Infrastructure.Services;
using StudentManagement.Application.DTOs.Trip;
using StudentManagement.Application.Validators.Trip;
using StudentManagement.Application.Services;
using StudentManagement.Application.Interfaces;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

// ── Database ──────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.MigrationsAssembly("StudentManagement.Infrastructure")
    )
);

// ── Identity ──────────────────────────────────────────────────────────────────
builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// ── Controllers ───────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddAuthorization();

// ── Swagger ───────────────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ── CORS (React dev server on Vite default port + production same-domain) ─────
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactDev", policy =>
        policy.WithOrigins(
                "http://localhost:5173",
                "https://universe-app.runasp.net",
                "http://universe-app.runasp.net"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
    );
});

// ── Authentication ────────────────────────────────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "your-super-secret-key-min-32-chars");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// ── Services ──────────────────────────────────────────────────────────────────
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<StudentManagement.Application.Interfaces.IDriverService, StudentManagement.Infrastructure.Services.DriverService>();
builder.Services.AddScoped<StudentManagement.Application.Services.IDashboardService, DashboardService>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IStudentDashboardService, StudentDashboardService>();
builder.Services.AddScoped<IInstructorDashboardService, InstructorDashboardService>();
builder.Services.AddScoped<IDriverDashboardService, DriverDashboardService>();
builder.Services.AddScoped<IDriverService, DriverService>();
builder.Services.AddScoped<ITripRepository, TripRepository>();
builder.Services.AddScoped<ITripService, TripService>();
builder.Services.AddScoped<IValidator<CreateTripDto>, CreateTripDtoValidator>();
builder.Services.AddScoped<IValidator<UpdateTripDto>, UpdateTripDtoValidator>();
builder.Services.AddScoped<IValidator<AddStudentToTripDto>, AddStudentToTripDtoValidator>();
builder.Services.AddScoped<IValidator<CreateStudentRequest>, CreateStudentRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateStudentRequest>, UpdateStudentRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateStudentStatusRequest>, UpdateStudentStatusRequestValidator>();
builder.Services.AddScoped<IValidator<StudentQueryParameters>, StudentQueryParametersValidator>();
builder.Services.AddScoped<EnrollmentService>();
builder.Services.AddScoped<PaymentService>();

builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IValidator<CreateCourseRequest>, CreateCourseRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateCourseRequest>, UpdateCourseRequestValidator>();
builder.Services.AddScoped<IValidator<CourseQueryParameters>, CourseQueryParametersValidator>();
builder.Services.AddScoped<IValidator<AssignInstructorRequest>, AssignInstructorRequestValidator>();

builder.Services.AddScoped<IInstructorRepository, InstructorRepository>();
builder.Services.AddScoped<IInstructorService, InstructorService>();
builder.Services.AddScoped<IValidator<CreateInstructorRequest>, CreateInstructorRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateInstructorRequest>, UpdateInstructorRequestValidator>();
builder.Services.AddScoped<IValidator<InstructorQueryParameters>, InstructorQueryParametersValidator>();
builder.Services.AddScoped<IInstructorRatingService, InstructorRatingService>();
builder.Services.AddScoped<IValidator<CreateInstructorRatingDto>, CreateInstructorRatingDtoValidator>();

var app = builder.Build();

await app.Services.SeedRolesAsync();

if (app.Environment.IsDevelopment())
{
    await app.Services.SeedTestDataAsync();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

// ── Serve the React (Vite) build as static files ───────────────────────────────
// UseDefaultFiles must come BEFORE UseStaticFiles, and looks for index.html
// automatically when a directory (e.g. "/") is requested.
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();
app.UseCors("ReactDev");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── SPA fallback ────────────────────────────────────────────────────────────────
// Any route that isn't an API route or an existing static file (e.g. a React
// Router client-side route like /students/5) should still return index.html
// so the React app can handle routing on the client.
app.MapFallbackToFile("index.html");

app.Run();