using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data.Configurations;

public class CourseInstructorConfiguration : IEntityTypeConfiguration<CourseInstructor>
{
    public void Configure(EntityTypeBuilder<CourseInstructor> builder)
    {
        builder.ToTable("CourseInstructors");
        builder.HasKey(ci => new { ci.CourseId, ci.InstructorSsn });
        builder.Property(ci => ci.Role).HasMaxLength(50);

        builder.HasOne(ci => ci.Course)
               .WithMany(c => c.CourseInstructors)
               .HasForeignKey(ci => ci.CourseId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ci => ci.Instructor)
               .WithMany(i => i.CourseInstructors)
               .HasForeignKey(ci => ci.InstructorSsn)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
