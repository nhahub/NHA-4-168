using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data.Configurations;

public class InstructorRatingConfiguration : IEntityTypeConfiguration<InstructorRating>
{
    public void Configure(EntityTypeBuilder<InstructorRating> builder)
    {
        builder.ToTable("InstructorRatings");
        builder.HasKey(r => new { r.StudentSsn, r.InstructorSsn });
        builder.Property(r => r.Score).IsRequired().HasColumnType("decimal(3,2)");
        builder.Property(r => r.Comment).HasMaxLength(1000);
        builder.Property(r => r.RatedAt).IsRequired();

        builder.HasOne(r => r.Student)
               .WithMany()
               .HasForeignKey(r => r.StudentSsn)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.Instructor)
               .WithMany(i => i.Ratings)
               .HasForeignKey(r => r.InstructorSsn)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
