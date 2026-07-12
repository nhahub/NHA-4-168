using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.DTOs.Enrollment;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Services;

public class EnrollmentService : IEnrollmentService
{
    private readonly AppDbContext _context;

    public EnrollmentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EnrollmentDto>> GetAllAsync()
    {
        return await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .Include(e => e.Payment)
            .Select(e => new EnrollmentDto
            {
                EnrollmentId = e.EnrollmentId,

                StudentSsn = e.StudentSsn,
                StudentName = e.Student.FirstName + " " + e.Student.LastName,

                CourseId = e.CourseId,
                CourseName = e.Course.CourseName,

                EnrolledOn = e.EnrolledOn,
                Grade = e.Grade,
                Status = e.Status,

                PaymentStatus = e.Payment != null
                    ? e.Payment.Status
                    : null
            })
            .ToListAsync();
    }

    public async Task<EnrollmentDto?> GetByIdAsync(int id)
    {
        return await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .Include(e => e.Payment)
            .Where(e => e.EnrollmentId == id)
            .Select(e => new EnrollmentDto
            {
                EnrollmentId = e.EnrollmentId,

                StudentSsn = e.StudentSsn,
                StudentName = e.Student.FirstName + " " + e.Student.LastName,

                CourseId = e.CourseId,
                CourseName = e.Course.CourseName,

                EnrolledOn = e.EnrolledOn,
                Grade = e.Grade,
                Status = e.Status,

                PaymentStatus = e.Payment != null
                    ? e.Payment.Status
                    : null
            })
            .FirstOrDefaultAsync();
    }

    public async Task<EnrollmentDto> CreateAsync(CreateEnrollmentDto dto)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.StudentSsn == dto.StudentSsn);

        if (student == null)
            throw new Exception("Student not found.");

        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.CourseId == dto.CourseId);

        if (course == null)
            throw new Exception("Course not found.");

        var alreadyEnrolled = await _context.Enrollments.AnyAsync(e =>
            e.StudentSsn == dto.StudentSsn &&
            e.CourseId == dto.CourseId);

        if (alreadyEnrolled)
            throw new Exception("Student is already enrolled in this course.");

        if (course.MaxCapacity.HasValue)
        {
            var enrolledCount = await _context.Enrollments
                .CountAsync(e => e.CourseId == dto.CourseId);

            if (enrolledCount >= course.MaxCapacity.Value)
                throw new Exception("Course is full.");
        }

        var enrollment = new Enrollment
        {
            StudentSsn = dto.StudentSsn,
            CourseId = dto.CourseId,
            EnrolledOn = DateTime.UtcNow,
            Status = "Active"
        };

        _context.Enrollments.Add(enrollment);
        await _context.SaveChangesAsync();

        return new EnrollmentDto
        {
            EnrollmentId = enrollment.EnrollmentId,

            StudentSsn = student.StudentSsn,
            StudentName = student.FirstName + " " + student.LastName,

            CourseId = course.CourseId,
            CourseName = course.CourseName,

            EnrolledOn = enrollment.EnrolledOn,
            Grade = enrollment.Grade,
            Status = enrollment.Status
        };
    }

    public async Task<bool> UpdateStatusAsync(int id, UpdateEnrollmentStatusDto dto)
    {
        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.EnrollmentId == id);

        if (enrollment == null)
            return false;

        enrollment.Status = dto.Status;

        if (!string.IsNullOrWhiteSpace(dto.Grade))
        {
            enrollment.Grade = dto.Grade;
        }

        await _context.SaveChangesAsync();

        return true;
    }
}