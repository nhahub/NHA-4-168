using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data.Configurations;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.ToTable("Courses");
        builder.HasKey(c => c.CourseId);
        builder.Property(c => c.CourseId).ValueGeneratedOnAdd();
        builder.Property(c => c.CourseName).IsRequired().HasMaxLength(100);
        builder.Property(c => c.Description).HasColumnType("nvarchar(max)");
        builder.Property(c => c.Level).HasMaxLength(20);
        builder.Property(c => c.Fee).HasColumnType("decimal(10,2)");
    }
}
