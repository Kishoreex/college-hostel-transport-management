using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReportsController(
        ApplicationDbContext context)
    {
        _context = context;
    }


    [HttpGet("export")]
    public IActionResult Export(
        string type,
        string gender = "All",
        string period = "all",
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        switch (type.ToLower())
        {
            case "students":
                return Redirect(
                    $"/api/reports/students?gender={gender}&period={period}&fromDate={fromDate:yyyy-MM-dd}&toDate={toDate:yyyy-MM-dd}");

            case "applications":
                return Redirect(
                    $"/api/reports/applications?gender={gender}&period={period}&fromDate={fromDate:yyyy-MM-dd}&toDate={toDate:yyyy-MM-dd}");

            case "outpasses":
                return Redirect(
                    $"/api/reports/outpasses?gender={gender}&period={period}&fromDate={fromDate:yyyy-MM-dd}&toDate={toDate:yyyy-MM-dd}");

            case "leaves":
                return Redirect(
                    $"/api/reports/leaves?gender={gender}&period={period}&fromDate={fromDate:yyyy-MM-dd}&toDate={toDate:yyyy-MM-dd}");

            case "vacating":
                return Redirect(
                    $"/api/reports/vacating?gender={gender}&period={period}&fromDate={fromDate:yyyy-MM-dd}&toDate={toDate:yyyy-MM-dd}");

            default:
                return BadRequest("Invalid Report Type");
        }
    }

    // YOUR EXISTING METHODS CONTINUE BELOW

 [HttpGet("students")]
public async Task<IActionResult> ExportStudents(
    string gender = "All",
    string period = "all",
    DateTime? fromDate = null,
    DateTime? toDate = null
)
{
  var allocations = await _context
    .HostelRoomAllocations
    .OrderBy(x => x.RoomNumber)
    .ThenBy(x => x.BedNumber)
    .ToListAsync();

    using var workbook = new XLWorkbook();

    var sheet = workbook.Worksheets.Add("Students");

    sheet.Cell("A1").Value =
        "MADHA HOSTEL MANAGEMENT SYSTEM";

    sheet.Cell("A2").Value =
        "Student Room Allocation Report";

    sheet.Cell("A3").Value =
        $"Generated On : {DateTime.Now:dd-MM-yyyy hh:mm tt}";

    sheet.Cell("A5").Value = "Room Number";
    sheet.Cell("B5").Value = "Bed Number";
    sheet.Cell("C5").Value = "Student ID";
    sheet.Cell("D5").Value = "Student Name";
    sheet.Cell("E5").Value = "College Name";
    sheet.Cell("F5").Value = "Department";
    sheet.Cell("G5").Value = "Year";
    sheet.Cell("H5").Value = "Batch";
    sheet.Cell("I5").Value = "Phone";
    sheet.Cell("J5").Value = "Parent Name";
    sheet.Cell("K5").Value = "Parent Phone";
    sheet.Cell("L5").Value = "Address";
    sheet.Cell("M5").Value = "Gender";

    int row = 6;

    foreach (var allocation in allocations)
    {
        var student =
            await _context.StudentRegistrations
            .FirstOrDefaultAsync(x =>
                x.StudentId == allocation.StudentId);

      if (student == null)
    continue;
DateTime createdDate = student.CreatedAt.Date;

DateTime startDate = DateTime.MinValue;
DateTime endDate = DateTime.Today;

switch (period.ToLower())
{
    case "today":
        startDate = DateTime.Today;
        break;

    case "1month":
        startDate = DateTime.Today.AddMonths(-1);
        break;

    case "3months":
        startDate = DateTime.Today.AddMonths(-3);
        break;

    case "6months":
        startDate = DateTime.Today.AddMonths(-6);
        break;

    case "1year":
        startDate = DateTime.Today.AddYears(-1);
        break;

    case "3years":
        startDate = DateTime.Today.AddYears(-3);
        break;

    case "custom":

        if (fromDate.HasValue)
            startDate = fromDate.Value.Date;

        if (toDate.HasValue)
            endDate = toDate.Value.Date;

        break;

    default:
        startDate = DateTime.MinValue;
        break;
}

if (createdDate < startDate ||
    createdDate > endDate)
{
    continue;
}
if (
    gender != "All" &&
    student.Gender.ToLower()
        != gender.ToLower()
)
{
    continue;
}

        sheet.Cell(row, 1).Value =
            allocation.RoomNumber;

        sheet.Cell(row, 2).Value =
            allocation.BedNumber;

        sheet.Cell(row, 3).Value =
            student.StudentId;

        sheet.Cell(row, 4).Value =
            student.StudentName;

        sheet.Cell(row, 5).Value =
            student.CollegeName;

        sheet.Cell(row, 6).Value =
            student.Department;

        sheet.Cell(row, 7).Value =
            student.Year;

        sheet.Cell(row, 8).Value =
            student.Batch;

        sheet.Cell(row, 9).Value =
            student.Phone;

        sheet.Cell(row, 10).Value =
            student.ParentName;

        sheet.Cell(row, 11).Value =
            student.ParentPhone;

        sheet.Cell(row, 12).Value =
            student.Address;

        sheet.Cell(row, 13).Value =
            student.Gender;

        row++;
    }

    sheet.Columns().AdjustToContents();

    var headerRange =
        sheet.Range("A5:M5");

    headerRange.Style.Font.Bold = true;

    headerRange.Style.Fill.BackgroundColor =
        XLColor.LightBlue;

    using var stream =
        new MemoryStream();

    workbook.SaveAs(stream);

    return File(
        stream.ToArray(),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Students.xlsx");
}

[HttpGet("applications")]
public async Task<IActionResult> ExportApplications(
    string gender = "All",
    string period = "all",
    DateTime? fromDate = null,
    DateTime? toDate = null
)
{
    var data = await _context.StudentRegistrations
        .OrderByDescending(x => x.CreatedAt)
        .ToListAsync();
        if (gender != "All")
{
    data = data
        .Where(x =>
            x.Gender.ToLower() ==
            gender.ToLower())
        .ToList();
}

    using var workbook = new XLWorkbook();

    var sheet =
        workbook.Worksheets.Add("Applications");

    sheet.Cell(1,1).Value = "Student ID";
    sheet.Cell(1,2).Value = "Student Name";
    sheet.Cell(1,3).Value = "College";
    sheet.Cell(1,4).Value = "Department";
    sheet.Cell(1,5).Value = "Year";
    sheet.Cell(1,6).Value = "Batch";
    sheet.Cell(1,7).Value = "Phone";
    sheet.Cell(1,8).Value = "Status";
    sheet.Cell(1,9).Value = "Approved Date";
    sheet.Cell(1,10).Value = "Rejected Date";

    int row = 2;

    foreach(var item in data)
    {
        sheet.Cell(row,1).Value = item.StudentId;
        sheet.Cell(row,2).Value = item.StudentName;
        sheet.Cell(row,3).Value = item.CollegeName;
        sheet.Cell(row,4).Value = item.Department;
        sheet.Cell(row,5).Value = item.Year;
        sheet.Cell(row,6).Value = item.Batch;
        sheet.Cell(row,7).Value = item.Phone;
        sheet.Cell(row,8).Value = item.Status;
        sheet.Cell(row,9).Value = item.ApprovedDate;
        sheet.Cell(row,10).Value = item.RejectedDate;

        row++;
    }

    sheet.Columns().AdjustToContents();

    using var stream = new MemoryStream();

    workbook.SaveAs(stream);

    return File(
        stream.ToArray(),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Applications.xlsx");
}

[HttpGet("outpasses")]
public async Task<IActionResult> ExportOutpasses(
    string gender = "All",
    string period = "all",
    DateTime? fromDate = null,
    DateTime? toDate = null
)
{
    var data = await _context.Outpasses
        .OrderByDescending(x => x.CreatedAt)
        .ToListAsync();

        if (gender != "All")
{
    data = data
        .Where(x =>
            x.Gender.ToLower() ==
            gender.ToLower())
        .ToList();
}

    using var workbook = new XLWorkbook();

    var sheet =
        workbook.Worksheets.Add("Outpasses");

    sheet.Cell(1,1).Value = "Student ID";
    sheet.Cell(1,2).Value = "Student Name";
    sheet.Cell(1,3).Value = "Destination";
    sheet.Cell(1,4).Value = "Reason";
    sheet.Cell(1,5).Value = "Valid From";
    sheet.Cell(1,6).Value = "Valid To";
    sheet.Cell(1,7).Value = "Exit Time";
    sheet.Cell(1,8).Value = "Return Time";
    sheet.Cell(1,9).Value = "Late Minutes";
    sheet.Cell(1,10).Value = "Status";

    int row = 2;

    foreach(var item in data)
    {
        sheet.Cell(row,1).Value = item.StudentId;
        sheet.Cell(row,2).Value = item.StudentName;
        sheet.Cell(row,3).Value = item.Destination;
        sheet.Cell(row,4).Value = item.Reason;
        sheet.Cell(row,5).Value = item.ValidFrom;
        sheet.Cell(row,6).Value = item.ValidTo;
        sheet.Cell(row,7).Value = item.ActualExitTime;
        sheet.Cell(row,8).Value = item.ActualReturnTime;
        sheet.Cell(row,9).Value = item.LateMinutes;
        sheet.Cell(row,10).Value = item.Status;

        row++;
    }

    sheet.Columns().AdjustToContents();

    using var stream = new MemoryStream();

    workbook.SaveAs(stream);

    return File(
        stream.ToArray(),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Outpasses.xlsx");
}

[HttpGet("leaves")]
public async Task<IActionResult> ExportLeaves(
    string gender = "All",
    string period = "all",
    DateTime? fromDate = null,
    DateTime? toDate = null
)
{
    var data = await _context.LeaveRequests
        .OrderByDescending(x => x.CreatedDate)
        .ToListAsync();

    using var workbook = new XLWorkbook();

    var sheet =
        workbook.Worksheets.Add("Leaves");

    sheet.Cell(1,1).Value = "Student ID";
    sheet.Cell(1,2).Value = "Leave Type";
    sheet.Cell(1,3).Value = "Campus";
    sheet.Cell(1,4).Value = "From";
    sheet.Cell(1,5).Value = "To";
    sheet.Cell(1,6).Value = "Reason";
    sheet.Cell(1,7).Value = "Status";
    sheet.Cell(1,8).Value = "Approved Date";

    int row = 2;

    foreach(var item in data)
    {
        sheet.Cell(row,1).Value = item.StudentId;
        sheet.Cell(row,2).Value = item.LeaveType;
        sheet.Cell(row,3).Value = item.Campus;
        sheet.Cell(row,4).Value = item.FromDate;
        sheet.Cell(row,5).Value = item.ToDate;
        sheet.Cell(row,6).Value = item.Reason;
        sheet.Cell(row,7).Value = item.Status;
        sheet.Cell(row,8).Value = item.ApprovedDate;

        row++;
    }

    sheet.Columns().AdjustToContents();

    using var stream = new MemoryStream();

    workbook.SaveAs(stream);

    return File(
        stream.ToArray(),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Leaves.xlsx");
}

[HttpGet("vacating")]
public async Task<IActionResult> ExportVacating(
    string gender = "All",
    string period = "all",
    DateTime? fromDate = null,
    DateTime? toDate = null
)
{
    var data = await _context.VacatingRequests
        .OrderByDescending(x => x.RequestDate)
        .ToListAsync();
if (gender != "All")
{
    data = data
        .Where(x =>
            x.Gender.ToLower() ==
            gender.ToLower())
        .ToList();
}
    using var workbook = new XLWorkbook();

    var sheet =
        workbook.Worksheets.Add("Vacating");

    sheet.Cell(1,1).Value = "Student ID";
    sheet.Cell(1,2).Value = "Student Name";
    sheet.Cell(1,3).Value = "Room Number";
    sheet.Cell(1,4).Value = "Department";
    sheet.Cell(1,5).Value = "Year";
    sheet.Cell(1,6).Value = "Phone";
    sheet.Cell(1,7).Value = "Reason";
    sheet.Cell(1,8).Value = "Status";

    int row = 2;

    foreach(var item in data)
    {
        sheet.Cell(row,1).Value = item.StudentId;
        sheet.Cell(row,2).Value = item.StudentName;
        sheet.Cell(row,3).Value = item.RoomNumber;
        sheet.Cell(row,4).Value = item.Department;
        sheet.Cell(row,5).Value = item.Year;
        sheet.Cell(row,6).Value = item.Phone;
        sheet.Cell(row,7).Value = item.Reason;
        sheet.Cell(row,8).Value = item.Status;

        row++;
    }

    sheet.Columns().AdjustToContents();

    using var stream = new MemoryStream();

    workbook.SaveAs(stream);

    return File(
        stream.ToArray(),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Vacating.xlsx");
}

}