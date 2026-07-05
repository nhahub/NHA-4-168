using Microsoft.AspNetCore.Identity;

namespace StudentManagement.Domain.Entities;

public class Student
{
    public int       StudentSsn      { get; set; }
    public string    FirstName       { get; set; } = string.Empty;
    public string    LastName        { get; set; } = string.Empty;
    public string    Email           { get; set; } = string.Empty;
    public string?   Phone           { get; set; }
    public DateTime? DateOfBirth     { get; set; }
    public string?   Address         { get; set; }
    public DateTime? EnrollmentDate  { get; set; }
    public string    Status          { get; set; } = "Active";
    public string?   UserId          { get; set; }

    public ICollection<Enrollment>     Enrollments     { get; set; } = [];
    public ICollection<StudentService> StudentServices { get; set; } = [];
    public ICollection<RideBooking>    RideBookings    { get; set; } = [];
    public IdentityUser? User { get; set; }
}
