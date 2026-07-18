using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");
        builder.HasKey(p => p.PaymentId);
        builder.Property(p => p.PaymentId).ValueGeneratedOnAdd();

        // EnrollmentId is now optional (trip payments have no enrollment), so the
        // uniqueness constraint must only apply to rows that actually have one.
        builder.HasIndex(p => p.EnrollmentId)
            .IsUnique()
            .HasFilter("[EnrollmentId] IS NOT NULL");

        builder.Property(p => p.Amount).HasColumnType("decimal(10,2)");
        builder.Property(p => p.PaymentMethod).HasMaxLength(50);
        builder.Property(p => p.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
        builder.Property(p => p.TransactionId).HasMaxLength(100);

        builder.HasOne(p => p.Enrollment)
            .WithOne(e => e.Payment)
            .HasForeignKey<Payment>(p => p.EnrollmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.Trip)
            .WithMany()
            .HasForeignKey(p => p.TripId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.Student)
            .WithMany()
            .HasForeignKey(p => p.StudentSsn)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
