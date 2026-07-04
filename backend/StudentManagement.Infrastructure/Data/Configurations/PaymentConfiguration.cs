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
        builder.HasIndex(p => p.EnrollmentId).IsUnique();
        builder.Property(p => p.Amount).HasColumnType("decimal(10,2)");
        builder.Property(p => p.PaymentMethod).HasMaxLength(50);
        builder.Property(p => p.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
        builder.Property(p => p.TransactionId).HasMaxLength(100);
    }
}
