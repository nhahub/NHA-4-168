using Microsoft.EntityFrameworkCore;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Student>          Students          { get; set; }
    public DbSet<Instructor>       Instructors       { get; set; }
    public DbSet<Course>           Courses           { get; set; }
    public DbSet<CourseInstructor> CourseInstructors { get; set; }
    public DbSet<Enrollment>       Enrollments       { get; set; }
    public DbSet<Payment>          Payments          { get; set; }
    public DbSet<Service>          Services          { get; set; }
    public DbSet<StudentService>   StudentServices   { get; set; }
    public DbSet<Driver>           Drivers           { get; set; }
    public DbSet<RideBooking>      RideBookings      { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
