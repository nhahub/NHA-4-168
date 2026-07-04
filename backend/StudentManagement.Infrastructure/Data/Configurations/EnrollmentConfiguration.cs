using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data.Configurations;

public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.ToTable("Enrollments");
        builder.HasKey(e => e.EnrollmentId);
        builder.Property(e => e.EnrollmentId).ValueGeneratedOnAdd();
        builder.Property(e => e.Grade).HasMaxLength(5);
        builder.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Active");

        builder.HasOne(e => e.Course)
               .WithMany(c => c.Enrollments)
               .HasForeignKey(e => e.CourseId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Payment)
               .WithOne(p => p.Enrollment)
               .HasForeignKey<Payment>(p => p.EnrollmentId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
