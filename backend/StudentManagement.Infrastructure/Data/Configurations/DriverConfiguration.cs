using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data.Configurations;

public class DriverConfiguration : IEntityTypeConfiguration<Driver>
{
    public void Configure(EntityTypeBuilder<Driver> builder)
    {
        builder.ToTable("Drivers");
        builder.HasKey(d => d.DriverSsn);
        builder.Property(d => d.DriverSsn).ValueGeneratedNever();
        builder.Property(d => d.FirstName).IsRequired().HasMaxLength(50);
        builder.Property(d => d.LastName).IsRequired().HasMaxLength(50);
        builder.Property(d => d.Phone).IsRequired().HasMaxLength(20);
        builder.HasIndex(d => d.Phone).IsUnique();
        builder.Property(d => d.LicenseNumber).IsRequired().HasMaxLength(50);
        builder.HasIndex(d => d.LicenseNumber).IsUnique();
        builder.Property(d => d.CarModel).HasMaxLength(50);
        builder.Property(d => d.CarPlate).HasMaxLength(20);
        builder.Property(d => d.Rating).HasColumnType("decimal(3,2)");
        builder.Property(d => d.UserId);

        builder.HasOne(d => d.User)
               .WithMany()
               .HasForeignKey(d => d.UserId)
               .OnDelete(DeleteBehavior.SetNull)
               .IsRequired(false);
    }
}
