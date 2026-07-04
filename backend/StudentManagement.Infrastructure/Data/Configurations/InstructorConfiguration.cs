using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data.Configurations;

public class InstructorConfiguration : IEntityTypeConfiguration<Instructor>
{
    public void Configure(EntityTypeBuilder<Instructor> builder)
    {
        builder.ToTable("Instructors");
        builder.HasKey(i => i.InstructorSsn);
        builder.Property(i => i.InstructorSsn).ValueGeneratedNever();
        builder.Property(i => i.FirstName).IsRequired().HasMaxLength(50);
        builder.Property(i => i.LastName).IsRequired().HasMaxLength(50);
        builder.Property(i => i.Email).IsRequired().HasMaxLength(100);
        builder.HasIndex(i => i.Email).IsUnique();
        builder.Property(i => i.Phone).HasMaxLength(20);
        builder.Property(i => i.Specialization).HasMaxLength(100);
        builder.Property(i => i.Rating).HasColumnType("decimal(3,2)");
    }
}
