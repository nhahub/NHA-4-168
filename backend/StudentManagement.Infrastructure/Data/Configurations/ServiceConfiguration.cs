using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data.Configurations;

public class ServiceConfiguration : IEntityTypeConfiguration<Service>
{
    public void Configure(EntityTypeBuilder<Service> builder)
    {
        builder.ToTable("Services");
        builder.HasKey(s => s.ServiceId);
        builder.Property(s => s.ServiceId).ValueGeneratedOnAdd();
        builder.Property(s => s.ServiceName).IsRequired().HasMaxLength(100);
        builder.Property(s => s.Description).HasColumnType("nvarchar(max)");
        builder.Property(s => s.WorkingDays).HasMaxLength(50);
        builder.Property(s => s.Location).HasMaxLength(255);
        builder.Property(s => s.Website).HasMaxLength(255);
    }
}
