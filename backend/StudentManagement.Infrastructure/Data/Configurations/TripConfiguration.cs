using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Configurations;

public class TripConfiguration : IEntityTypeConfiguration<Trip>
{
    public void Configure(EntityTypeBuilder<Trip> builder)
    {
        builder.HasKey(t => t.TripId);

        builder.Property(t => t.Destination)
            
            .HasMaxLength(255);

        builder.Property(t => t.PickupArea)
            
            .HasMaxLength(255);

        builder.Property(t => t.Status)
            
            .HasMaxLength(20)
            .HasDefaultValue("Pending");

        builder.Property(t => t.Price)
            .HasColumnType("decimal(10,2)");

        builder.HasOne(t => t.Driver)
            .WithMany()
            .HasForeignKey(t => t.DriverSsn)
            .OnDelete(DeleteBehavior.Restrict);
    }
}