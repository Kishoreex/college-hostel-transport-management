using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Models;
using System.Linq;
namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransportReportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TransportReportsController(ApplicationDbContext context)
    {
        _context = context;
    }
[HttpGet("export")]
public IActionResult Export(string type, int months = 12)
{
    switch (type.ToLower())
    {
        case "students":
            return Redirect("/api/TransportReports/students");

        case "buses":
            return Redirect("/api/TransportReports/buses");

        case "applications":
            return Redirect($"/api/TransportReports/applications?months={months}");

        case "cancellations":
            return Redirect($"/api/TransportReports/cancellations?months={months}");

        default:
            return BadRequest("Invalid Report");
    }
}
    [HttpGet("students")]
public IActionResult ExportStudents()
{
    var students = _context.TransportRegistrations
        .Include(x => x.Route)
        .Include(x => x.Stop)
        .Where(x => x.IsApproved)
        .ToList();

    using var workbook = new XLWorkbook();

    var ws = workbook.Worksheets.Add("Transport Students");

    ws.Cell(1, 1).Value = "Student ID";
    ws.Cell(1, 2).Value = "Student Name";
    ws.Cell(1, 3).Value = "College";
    ws.Cell(1, 4).Value = "Department";
    ws.Cell(1, 5).Value = "Year";
    ws.Cell(1, 6).Value = "Batch";
    ws.Cell(1, 7).Value = "Phone";
    ws.Cell(1, 8).Value = "Parent Name";
    ws.Cell(1, 9).Value = "Parent Phone";
    ws.Cell(1,10).Value = "Route";
    ws.Cell(1,11).Value = "Bus Number";
    ws.Cell(1,12).Value = "Pickup Point";
    ws.Cell(1,13).Value = "Pickup Time";
    ws.Cell(1,14).Value = "Status";

    int row = 2;

    foreach (var s in students)
    {
        ws.Cell(row, 1).Value = s.StudentId;
        ws.Cell(row, 2).Value = s.StudentName;
        ws.Cell(row, 3).Value = s.CollegeName;
        ws.Cell(row, 4).Value = s.Department;
        ws.Cell(row, 5).Value = s.Year;
        ws.Cell(row, 6).Value = s.Batch;
        ws.Cell(row, 7).Value = s.Phone;
        ws.Cell(row, 8).Value = s.ParentName;
        ws.Cell(row, 9).Value = s.ParentPhone;
        ws.Cell(row,10).Value = s.Route?.RouteName ?? "";
        ws.Cell(row,11).Value = s.Route?.BusNumber ?? "";
        ws.Cell(row,12).Value = s.Stop?.StopName ?? "";
        ws.Cell(row,13).Value = s.Stop != null ? s.Stop.PickupTime.ToString(@"hh\:mm") : "";
        ws.Cell(row,14).Value = s.Status;

        row++;
    }

    ws.Columns().AdjustToContents();

    using var stream = new MemoryStream();

    workbook.SaveAs(stream);

    return File(
        stream.ToArray(),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "TransportStudents.xlsx");
}
[HttpGet("buses")]
public IActionResult ExportBuses()
{
    var routes = _context.TransportRoutes
        .Include(x => x.Stops)
        .ToList();

    using var workbook = new XLWorkbook();

    var ws = workbook.Worksheets.Add("Bus Details");

    ws.Cell(1, 1).Value = "Route";
    ws.Cell(1, 2).Value = "Bus Number";
    ws.Cell(1, 3).Value = "Driver";
    ws.Cell(1, 4).Value = "Driver Phone";
    ws.Cell(1, 5).Value = "Morning Time";
    ws.Cell(1, 6).Value = "Evening Time";
    ws.Cell(1, 7).Value = "Stops";

    int row = 2;

    foreach (var route in routes)
    {
        ws.Cell(row, 1).Value = route.RouteName;
        ws.Cell(row, 2).Value = route.BusNumber;
        ws.Cell(row, 3).Value = route.DriverName;
        ws.Cell(row, 4).Value = route.DriverPhone;
        ws.Cell(row, 5).Value = route.MorningTime.ToString(@"hh\:mm");
        ws.Cell(row, 6).Value = route.EveningTime.ToString(@"hh\:mm");

        ws.Cell(row, 7).Value = string.Join(
            ", ",
            route.Stops.Select(x => x.StopName)
        );

        row++;
    }

    ws.Columns().AdjustToContents();

    using var stream = new MemoryStream();

    workbook.SaveAs(stream);

    return File(
        stream.ToArray(),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "BusDetails.xlsx");
}
[HttpGet("applications")]
public IActionResult ExportApplications(int months = 12)
{
    var fromDate = DateTime.Now.AddMonths(-months);

    var applications = _context.TransportRegistrations
        .Include(x => x.Route)
        .Include(x => x.Stop)
        .Where(x => x.CreatedAt >= fromDate)
        .ToList();

    using var workbook = new XLWorkbook();

    CreateApplicationSheet(
        workbook,
        "Pending Applications",
        applications.Where(x => x.Status == "Pending").ToList());

    CreateApplicationSheet(
        workbook,
        "Approved Applications",
        applications.Where(x => x.Status == "Approved").ToList());

    CreateApplicationSheet(
        workbook,
        "Rejected Applications",
        applications.Where(x => x.Status == "Rejected").ToList());

    using var stream = new MemoryStream();

    workbook.SaveAs(stream);

    return File(
        stream.ToArray(),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "TransportApplications.xlsx");
}
private void CreateApplicationSheet(
    XLWorkbook workbook,
    string sheetName,
    List<TransportRegistration> students)
{
    var ws = workbook.Worksheets.Add(sheetName);

    ws.Cell(1,1).Value="Student Name";
    ws.Cell(1,2).Value="Register Number";
    ws.Cell(1,3).Value="College";
    ws.Cell(1,4).Value="Department";
    ws.Cell(1,5).Value="Year";
    ws.Cell(1,6).Value="Batch";
    ws.Cell(1,7).Value="Phone";
    ws.Cell(1,8).Value="Route";
    ws.Cell(1,9).Value="Pickup Point";
    ws.Cell(1,10).Value="Status";

    int row = 2;

    foreach(var s in students)
    {
        ws.Cell(row,1).Value = s.StudentName;
        ws.Cell(row,2).Value = s.RegisterNumber;
        ws.Cell(row,3).Value = s.CollegeName;
        ws.Cell(row,4).Value = s.Department;
        ws.Cell(row,5).Value = s.Year;
        ws.Cell(row,6).Value = s.Batch;
        ws.Cell(row,7).Value = s.Phone;
        ws.Cell(row,8).Value = s.Route?.RouteName ?? "";
        ws.Cell(row,9).Value = s.Stop?.StopName ?? "";
        ws.Cell(row,10).Value = s.Status;

        row++;
    }

    ws.Columns().AdjustToContents();
}
[HttpGet("cancellations")]
public IActionResult ExportCancellations(int months = 12)
{
    var fromDate = DateTime.Now.AddMonths(-months);

    var data = _context.TransportCancellations
        .Where(x => x.RequestedAt >= fromDate)
        .ToList();

    using var workbook = new XLWorkbook();

    CreateCancellationSheet(
        workbook,
        "Pending",
        data.Where(x => x.Status == "Pending").ToList());

    CreateCancellationSheet(
        workbook,
        "Approved",
        data.Where(x => x.Status == "Approved").ToList());

    CreateCancellationSheet(
        workbook,
        "Rejected",
        data.Where(x => x.Status == "Rejected").ToList());

    using var stream = new MemoryStream();

    workbook.SaveAs(stream);

    return File(
        stream.ToArray(),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "TransportCancellationReport.xlsx");
}
private void CreateCancellationSheet(
    XLWorkbook workbook,
    string sheetName,
    List<TransportCancellation> list)
{
    var ws = workbook.Worksheets.Add(sheetName);

    ws.Cell(1,1).Value="Student ID";
    ws.Cell(1,2).Value="Student Name";
    ws.Cell(1,3).Value="College";
    ws.Cell(1,4).Value="Department";
    ws.Cell(1,5).Value="Year";
    ws.Cell(1,6).Value="Batch";
    ws.Cell(1,7).Value="Phone";
    ws.Cell(1,8).Value="Bus Route";
    ws.Cell(1,9).Value="Bus Number";
    ws.Cell(1,10).Value="Pickup Point";
    ws.Cell(1,11).Value="Reason";
    ws.Cell(1,12).Value="Status";
    ws.Cell(1,13).Value="Requested Date";

    int row = 2;

    foreach(var s in list)
    {
        ws.Cell(row,1).Value = s.StudentId;
        ws.Cell(row,2).Value = s.StudentName;
        ws.Cell(row,3).Value = s.CollegeName;
        ws.Cell(row,4).Value = s.Department;
        ws.Cell(row,5).Value = s.Year;
        ws.Cell(row,6).Value = s.Batch;
        ws.Cell(row,7).Value = s.Phone;
        ws.Cell(row,8).Value = s.BusRoute;
        ws.Cell(row,9).Value = s.BusNumber;
        ws.Cell(row,10).Value = s.PickupPoint;
        ws.Cell(row,11).Value = s.Reason;
        ws.Cell(row,12).Value = s.Status;
        ws.Cell(row,13).Value = s.RequestedAt.ToString("dd-MM-yyyy HH:mm");

        row++;
    }

    ws.Columns().AdjustToContents();
}
}