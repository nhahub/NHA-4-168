using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<IdentityUser, IdentityRole, string>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Student>          Students          { get; set; }
    public DbSet<Instructor>       Instructors       { get; set; }
    public DbSet<Course>           Courses           { get; set; }
    public DbSet<CourseInstructor> CourseInstructors { get; set; }
    public DbSet<Enrollment>       Enrollments       { get; set; }
    public DbSet<Payment>          Payments          { get; set; }
    public DbSet<Service>          Services          { get; set; }
    public DbSet<StudentService> StudentServices { get; set; }
    public DbSet<Trip> Trips { get; set; }
    public DbSet<TripStudent> TripStudents { get; set; }
    public DbSet<Driver>           Drivers           { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
