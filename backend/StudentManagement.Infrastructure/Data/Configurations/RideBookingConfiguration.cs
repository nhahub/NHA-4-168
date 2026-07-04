using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data.Configurations;

public class RideBookingConfiguration : IEntityTypeConfiguration<RideBooking>
{
    public void Configure(EntityTypeBuilder<RideBooking> builder)
    {
        builder.ToTable("RideBookings");
        builder.HasKey(rb => rb.BookingId);
        builder.Property(rb => rb.BookingId).ValueGeneratedOnAdd();
        builder.Property(rb => rb.PickupLocation).IsRequired().HasMaxLength(255);
        builder.Property(rb => rb.DropoffLocation).IsRequired().HasMaxLength(255);
        builder.Property(rb => rb.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
        builder.Property(rb => rb.Fare).HasColumnType("decimal(10,2)");

        builder.HasOne(rb => rb.Driver)
               .WithMany(d => d.RideBookings)
               .HasForeignKey(rb => rb.DriverSsn)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
