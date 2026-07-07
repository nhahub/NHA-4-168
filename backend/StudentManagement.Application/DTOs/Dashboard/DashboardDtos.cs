namespace StudentManagement.Application.DTOs.Dashboard;

public class StudentSummaryDto
{
    public int StudentId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class EnrollmentSummaryDto
{
    public int EnrollmentId { get; set; }
    public int StudentId { get; set; }
    public int CourseId { get; set; }
    public DateTime? EnrolledOn { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class PaymentSummaryDto
{
    public int PaymentId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? PaymentDate { get; set; }
}

public class ServiceRequestDto
{
    public int StudentServiceId { get; set; }
    public int StudentId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public DateTime? RequestedDate { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class RideBookingDto
{
    public int BookingId { get; set; }
    public int StudentId { get; set; }
    public int DriverId { get; set; }
    public string PickupLocation { get; set; } = string.Empty;
    public string DropoffLocation { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal? Fare { get; set; }
}

public class DashboardSummaryDto
{
    public int TotalStudents { get; set; }
    public int ActiveEnrollments { get; set; }
    public int PendingPayments { get; set; }
    public int PendingServiceRequests { get; set; }
    public int ActiveRides { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class EnrollmentTrendDto
{
    public DateTime Date { get; set; }
    public int Enrollments { get; set; }
    public int CompletedEnrollments { get; set; }
}

public class StudentApplicationDto
{
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public int CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public DateTime? AppliedOn { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class ActivityLogDto
{
    public string Title { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; }
    public string Tone { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
}

public class DateRange
{
    public int Days { get; set; } = 30;
    public DateOnly? From { get; set; }
    public DateOnly? To { get; set; }
}