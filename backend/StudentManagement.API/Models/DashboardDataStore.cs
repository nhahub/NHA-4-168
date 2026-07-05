using System;
using System.Collections.Generic;

namespace StudentManagement.API.Models;

public class DashboardDataStore
{
    public DashboardStats Stats { get; set; } = new()
    {
        Students = new StudentStats { Total = 250, Active = 210, NewThisPeriod = 18 },
        Courses = new CourseStats { Total = 14, Active = 11 },
        Enrollments = new EnrollmentStats { Total = 430, ActiveThisPeriod = 95, CompletedThisPeriod = 30 },
        Payments = new PaymentStats { TotalRevenue = 87500.00m, RevenueThisPeriod = 9000.00m, Pending = 12, Failed = 3 },
        ServiceRequests = new ServiceRequestStats { Total = 60, Pending = 8, Approved = 45, Rejected = 7 },
        Rides = new RideStats { Total = 180, Completed = 162, Cancelled = 10, Pending = 8, TotalFareCollected = 21600.00m }
    };

    public List<StudentApplicationDto> RecentApplications { get; set; } = new()
    {
        new StudentApplicationDto { Name = "Alice Thompson", Course = "Digital Marketing 101", Date = "Oct 24, 2023", Status = "Approved", Tone = "success" },
        new StudentApplicationDto { Name = "Marcus Webb", Course = "Fullstack Web Dev", Date = "Oct 23, 2023", Status = "Reviewing", Tone = "info" },
        new StudentApplicationDto { Name = "Elena Rodriguez", Course = "Cybersecurity Essentials", Date = "Oct 22, 2023", Status = "Pending", Tone = "danger" }
    };

    public List<ActivityLogDto> RecentActivities { get; set; } = new()
    {
        new ActivityLogDto { Title = "Sarah Jenkins enrolled in Advanced UI Design", Meta = "2 minutes ago", Icon = "BookOpenCheck", Tone = "info" },
        new ActivityLogDto { Title = "John Doe processed payment #TRX-8821", Meta = "15 minutes ago", Icon = "BadgeDollarSign", Tone = "success" },
        new ActivityLogDto { Title = "System Alert: Driver Robert P. is 10 mins late for Pickup", Meta = "42 minutes ago", Icon = "CircleAlert", Tone = "danger" },
        new ActivityLogDto { Title = "Admin Alex updated the course syllabus for Python Fundamentals", Meta = "1 hour ago", Icon = "Layers3", Tone = "neutral" },
        new ActivityLogDto { Title = "New Student Registered: Michael Chen (ID: 4421)", Meta = "2 hours ago", Icon = "GraduationCap", Tone = "info" }
    };

    private readonly object _lock = new();

    public void UpdateApplicationStatus(string name, string newStatus)
    {
        lock (_lock)
        {
            var app = RecentApplications.Find(a => a.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
            if (app != null)
            {
                var oldStatus = app.Status;
                app.Status = newStatus;
                app.Tone = newStatus.ToLower() switch
                {
                    "approved" => "success",
                    "reviewing" => "info",
                    "pending" => "danger",
                    _ => "neutral"
                };

                // Add an activity log
                RecentActivities.Insert(0, new ActivityLogDto
                {
                    Title = $"Admin updated {name}'s application status to {newStatus}",
                    Meta = "Just now",
                    Icon = "GraduationCap",
                    Tone = app.Tone
                });

                // Update stats if needed (e.g. active enrollment/student count)
                if (newStatus.Equals("Approved", StringComparison.OrdinalIgnoreCase) && !oldStatus.Equals("Approved", StringComparison.OrdinalIgnoreCase))
                {
                    Stats.Students.Active++;
                    Stats.Enrollments.ActiveThisPeriod++;
                }
            }
        }
    }
}

public class DashboardStats
{
    public StudentStats Students { get; set; } = new();
    public CourseStats Courses { get; set; } = new();
    public EnrollmentStats Enrollments { get; set; } = new();
    public PaymentStats Payments { get; set; } = new();
    public ServiceRequestStats ServiceRequests { get; set; } = new();
    public RideStats Rides { get; set; } = new();
}

public class StudentStats
{
    public int Total { get; set; }
    public int Active { get; set; }
    public int NewThisPeriod { get; set; }
}

public class CourseStats
{
    public int Total { get; set; }
    public int Active { get; set; }
}

public class EnrollmentStats
{
    public int Total { get; set; }
    public int ActiveThisPeriod { get; set; }
    public int CompletedThisPeriod { get; set; }
}

public class PaymentStats
{
    public decimal TotalRevenue { get; set; }
    public decimal RevenueThisPeriod { get; set; }
    public int Pending { get; set; }
    public int Failed { get; set; }
}

public class ServiceRequestStats
{
    public int Total { get; set; }
    public int Pending { get; set; }
    public int Approved { get; set; }
    public int Rejected { get; set; }
}

public class RideStats
{
    public int Total { get; set; }
    public int Completed { get; set; }
    public int Cancelled { get; set; }
    public int Pending { get; set; }
    public decimal TotalFareCollected { get; set; }
}

public class StudentApplicationDto
{
    public string Name { get; set; } = string.Empty;
    public string Course { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Tone { get; set; } = string.Empty;
}

public class ActivityLogDto
{
    public string Title { get; set; } = string.Empty;
    public string Meta { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Tone { get; set; } = string.Empty;
}
