using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data.Configurations;

public class StudentServiceConfiguration : IEntityTypeConfiguration<StudentService>
{
    public void Configure(EntityTypeBuilder<StudentService> builder)
    {
        builder.ToTable("StudentServices");
        builder.HasKey(ss => ss.StudentServiceId);
        builder.Property(ss => ss.StudentServiceId).ValueGeneratedOnAdd();
        builder.Property(ss => ss.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Pending");

        builder.HasOne(ss => ss.Service)
               .WithMany(s => s.StudentServices)
               .HasForeignKey(ss => ss.ServiceId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
