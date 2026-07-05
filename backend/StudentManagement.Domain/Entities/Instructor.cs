using Microsoft.AspNetCore.Identity;

namespace StudentManagement.Domain.Entities;

public class Instructor
{
    public int       InstructorSsn  { get; set; }
    public string    FirstName      { get; set; } = string.Empty;
    public string    LastName       { get; set; } = string.Empty;
    public string?   Phone          { get; set; }
    public string    Email          { get; set; } = string.Empty;
    public string?   Specialization { get; set; }
    public DateTime? HireDate       { get; set; }
    public decimal?  Rating         { get; set; }
    public string?   UserId         { get; set; }

    public ICollection<CourseInstructor> CourseInstructors { get; set; } = [];
    public IdentityUser? User { get; set; }
}
