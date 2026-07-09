using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data.Configurations;

public class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        builder.ToTable("Students");
        builder.HasKey(s => s.StudentSsn);
        builder.Property(s => s.StudentSsn).ValueGeneratedNever();
       builder.Property(s => s.FirstName).HasMaxLength(50);
       builder.Property(s => s.LastName).HasMaxLength(50);
        builder.Property(s => s.Email).IsRequired().HasMaxLength(100);
        builder.HasIndex(s => s.Email).IsUnique();
        builder.Property(s => s.Phone).HasMaxLength(20);
        builder.Property(s => s.Address).HasMaxLength(255);
        builder.Property(s => s.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Active");
        builder.Property(s => s.UserId);

        builder.HasOne(s => s.User)
               .WithMany()
               .HasForeignKey(s => s.UserId)
               .OnDelete(DeleteBehavior.SetNull)
               .IsRequired(false);

        builder.HasMany(s => s.Enrollments)
               .WithOne(e => e.Student)
               .HasForeignKey(e => e.StudentSsn)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(s => s.StudentServices)
               .WithOne(ss => ss.Student)
               .HasForeignKey(ss => ss.StudentSsn)
               .OnDelete(DeleteBehavior.Restrict);

     
    }
}
