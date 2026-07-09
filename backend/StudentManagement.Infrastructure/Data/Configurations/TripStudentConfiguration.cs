using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Configurations;

public class TripStudentConfiguration : IEntityTypeConfiguration<TripStudent>
{
    public void Configure(EntityTypeBuilder<TripStudent> builder)
    {
        builder.HasKey(ts => new { ts.TripId, ts.StudentSsn });

        builder.HasOne(ts => ts.Trip)
            .WithMany(t => t.TripStudents)
            .HasForeignKey(ts => ts.TripId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ts => ts.Student)
            .WithMany()
            .HasForeignKey(ts => ts.StudentSsn)
            .OnDelete(DeleteBehavior.Restrict);
    }
}