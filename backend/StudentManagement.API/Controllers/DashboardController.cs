using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using System.Text;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly DashboardDataStore _dataStore;

    public DashboardController(DashboardDataStore dataStore)
    {
        _dataStore = dataStore;
    }

    [HttpGet("summary")]
    public IActionResult GetSummary()
    {
        return Ok(new
        {
            stats = _dataStore.Stats,
            recentApplications = _dataStore.RecentApplications,
            recentActivities = _dataStore.RecentActivities
        });
    }

    [HttpPatch("applications/{name}/status")]
    public IActionResult UpdateApplicationStatus(string name, [FromBody] UpdateStatusRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Status))
        {
            return BadRequest(new { error = "Status is required." });
        }

        _dataStore.UpdateApplicationStatus(name, request.Status);
        return Ok(new { name, status = request.Status });
    }

    [HttpGet("export")]
    public IActionResult ExportReport()
    {
        var builder = new StringBuilder();
        builder.AppendLine("Metric,Value");
        builder.AppendLine($"Total Students,{_dataStore.Stats.Students.Total}");
        builder.AppendLine($"Active Students,{_dataStore.Stats.Students.Active}");
        builder.AppendLine($"New Students This Period,{_dataStore.Stats.Students.NewThisPeriod}");
        builder.AppendLine($"Total Courses,{_dataStore.Stats.Courses.Total}");
        builder.AppendLine($"Active Courses,{_dataStore.Stats.Courses.Active}");
        builder.AppendLine($"Total Enrollments,{_dataStore.Stats.Enrollments.Total}");
        builder.AppendLine($"Active Enrollments This Period,{_dataStore.Stats.Enrollments.ActiveThisPeriod}");
        builder.AppendLine($"Completed Enrollments This Period,{_dataStore.Stats.Enrollments.CompletedThisPeriod}");
        builder.AppendLine($"Total Revenue,${_dataStore.Stats.Payments.TotalRevenue}");
        builder.AppendLine($"Revenue This Period,${_dataStore.Stats.Payments.RevenueThisPeriod}");
        builder.AppendLine($"Pending Payments,{_dataStore.Stats.Payments.Pending}");
        builder.AppendLine($"Failed Payments,{_dataStore.Stats.Payments.Failed}");
        builder.AppendLine($"Total Service Requests,{_dataStore.Stats.ServiceRequests.Total}");
        builder.AppendLine($"Pending Service Requests,{_dataStore.Stats.ServiceRequests.Pending}");
        builder.AppendLine($"Approved Service Requests,{_dataStore.Stats.ServiceRequests.Approved}");
        builder.AppendLine($"Rejected Service Requests,{_dataStore.Stats.ServiceRequests.Rejected}");
        builder.AppendLine($"Total Rides,{_dataStore.Stats.Rides.Total}");
        builder.AppendLine($"Completed Rides,{_dataStore.Stats.Rides.Completed}");
        builder.AppendLine($"Cancelled Rides,{_dataStore.Stats.Rides.Cancelled}");
        builder.AppendLine($"Pending Rides,{_dataStore.Stats.Rides.Pending}");
        builder.AppendLine($"Total Fare Collected,${_dataStore.Stats.Rides.TotalFareCollected}");

        var csvBytes = Encoding.UTF8.GetBytes(builder.ToString());
        return File(csvBytes, "text/csv", "Dashboard_Report.csv");
    }
}

public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
