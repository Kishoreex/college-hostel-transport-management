using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;
using HostelTransportAPI.Models;
using HostelTransportAPI.DTOs;
using Microsoft.AspNetCore.SignalR;
using HostelTransportAPI.Hubs;
namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OutpassesController : ControllerBase
{
   private readonly ApplicationDbContext _context;
private readonly IHubContext<NotificationHub> _hub;

 public OutpassesController(
    ApplicationDbContext context,
    IHubContext<NotificationHub> hub)
{
    _context = context;
    _hub = hub;
}
[HttpGet]
public IActionResult GetAll()
{
    try
    {
        var now = DateTime.Now;

        var outpasses = _context.Outpasses.ToList();

        foreach (var outpass in outpasses)
        {
            if (outpass.Status == "Pending")
            {
                if (now > outpass.ValidTo)
                {
                    outpass.Status = "Not Accepted By Warden";
                }
            }
        }

        _context.SaveChanges();

        return Ok(
            _context.Outpasses
                .OrderByDescending(x => x.Id)
                .ToList()
        );
    }
    catch (Exception ex)
    {
        Console.WriteLine(ex.ToString());

        return StatusCode(500, ex.Message);
    }
}
    [HttpGet("{studentId}")]
    public IActionResult GetByStudent(string studentId)
    {
        var outpasses = _context.Outpasses
            .Where(x => x.StudentId == studentId)
            .ToList();

        return Ok(outpasses);
    }
[HttpPost]
public async Task<IActionResult> Create(Outpass outpass)
{
var hasActiveOutpass = _context.Outpasses.Any(x =>
    x.StudentId == outpass.StudentId &&
    (
        x.Status == "Pending" ||

        (x.Status == "Approved" &&
        (
            x.OutpassState == "Waiting For Exit" ||
            x.OutpassState == "Active" ||
            x.OutpassState == "Outside Hostel"
        ))
    )
);

if (hasActiveOutpass)
{
    return BadRequest(
        "Student already has an active outpass."
    );
}
    outpass.ValidFrom = DateTime.SpecifyKind(
        outpass.ValidFrom,
        DateTimeKind.Local);

    outpass.ValidTo = DateTime.SpecifyKind(
        outpass.ValidTo,
        DateTimeKind.Local);

    var student = _context.StudentRegistrations
        .FirstOrDefault(x => x.StudentId == outpass.StudentId);

    if (student != null)
    {
        outpass.StudentName = student.StudentName;
        outpass.Gender = student.Gender;
    }

    _context.Outpasses.Add(outpass);

    await _context.SaveChangesAsync();
await _hub.Clients.All.SendAsync(
    "OutpassCreated"
);

    return Ok(outpass);
}

[HttpPut("approve/{id}")]
public async Task<IActionResult> Approve(int id)
{
    var outpass = await _context.Outpasses.FindAsync(id);

    if (outpass == null)
        return NotFound();

outpass.Status = "Approved";
outpass.OutpassState = "Waiting For Exit";

  await _context.SaveChangesAsync();

await _hub.Clients.All.SendAsync(
    "OutpassUpdated",
    outpass.StudentId
);
    return Ok(outpass);
}

[HttpPut("reject/{id}")]
public async Task<IActionResult> Reject(
    int id,
    [FromBody] RejectOutpassDto dto)
{
    var outpass = await _context.Outpasses.FindAsync(id);

    if (outpass == null)
        return NotFound();

    outpass.Status = "Rejected";
    outpass.RejectReason = dto.RejectReason;

    await _context.SaveChangesAsync();

    await _hub.Clients.All.SendAsync(
        "OutpassUpdated",
        outpass.StudentId
    );

    return Ok(outpass);
}
[HttpPut("activate/{id}")]
public async Task<IActionResult> Activate(int id)
{
    var outpass = await _context.Outpasses.FindAsync(id);

    if (outpass == null)
        return NotFound();

    outpass.OutpassState = "Active";

    await _context.SaveChangesAsync();

    return Ok(outpass);
}
[HttpPut("exit/{id}")]
public async Task<IActionResult> MarkExit(
    int id,
    [FromBody] LocationDto dto)
{
    var outpass = await _context.Outpasses.FindAsync(id);

    if (outpass == null)
        return NotFound();

    // Prevent duplicate exit recording
    if (outpass.ExitRecorded)
        return Ok(outpass);

    outpass.OutpassState = "Outside Hostel";

    outpass.ActualExitTime = DateTime.Now;

    outpass.ExitLatitude = dto.Latitude;

    outpass.ExitLongitude = dto.Longitude;

    outpass.ExitRecorded = true;

    // Calculate requested departure DateTime
    var requestedExit =
        outpass.ValidFrom.Date +
        TimeSpan.Parse(outpass.TimeOut);

    // Calculate early exit
    if (outpass.ActualExitTime.Value < requestedExit)
    {
       var diff = requestedExit - outpass.ActualExitTime.Value;

outpass.EarlyExitMinutes =
    diff.TotalMinutes >= 1
        ? (int)Math.Floor(diff.TotalMinutes)
        : 0;
    }
    else
    {
        outpass.EarlyExitMinutes = 0;
    }

    await _context.SaveChangesAsync();
await _hub.Clients.All.SendAsync(
    "OutpassUpdated",
    outpass.StudentId
);
    return Ok(outpass);
}
[HttpPut("return/{id}")]
public async Task<IActionResult> MarkReturn(
    int id,
    [FromBody] LocationDto dto)
{
    var outpass = await _context.Outpasses.FindAsync(id);

    if (outpass == null)
        return NotFound();

    outpass.OutpassState = "Returned";
outpass.Status = "Completed";
    outpass.ActualReturnTime = DateTime.Now;

    outpass.ReturnLatitude = dto.Latitude;

    outpass.ReturnLongitude = dto.Longitude;

    if (outpass.ActualReturnTime > outpass.ValidTo)
    {
        outpass.LateMinutes =
            (int)(outpass.ActualReturnTime.Value - outpass.ValidTo)
            .TotalMinutes;
    }
if (outpass.LeaveRequestId > 0)
{
    var leave = await _context.LeaveRequests
        .FindAsync(outpass.LeaveRequestId);

    if (leave != null)
    {
        leave.Status = "Completed";
    }
}
    await _context.SaveChangesAsync();
await _hub.Clients.All.SendAsync(
    "OutpassUpdated",
    outpass.StudentId
);
    return Ok(outpass);
}[HttpGet("active/{studentId}")]
public IActionResult HasActiveOutpass(string studentId)
{
    var now = DateTime.Now;

var expiredOutpasses = _context.Outpasses
    .Where(x =>
        (x.OutpassState == "Active" ||
         x.OutpassState == "Waiting For Exit") &&
        x.ValidTo < now &&
        x.ActualExitTime == null)
    .ToList();

foreach (var item in expiredOutpasses)
{
    item.OutpassState = "Expired";
    
}

_context.SaveChanges();
    Console.WriteLine("StudentId = " + studentId);

    var list = _context.Outpasses
        .Where(x => x.StudentId == studentId)
        .ToList();

    Console.WriteLine("Found = " + list.Count);

    foreach (var item in list)
    {
        Console.WriteLine(
            item.StudentId +
            " " +
            item.OutpassState
        );
    }

   var active = list.Any(x =>
    x.OutpassState == "Waiting For Exit" ||
    x.OutpassState == "Active" ||
    x.OutpassState == "Outside Hostel"
);

    Console.WriteLine("Active = " + active);

    return Ok(active);
}
[HttpPut("expire")]
public async Task<IActionResult> ExpireOldOutpasses()
{
    var now = DateTime.Now;

    var list = _context.Outpasses
   .Where(x =>
    (x.OutpassState == "Active" ||
     x.OutpassState == "Waiting For Exit") &&
    x.ValidTo < now &&
    x.ActualExitTime == null)
        .ToList();

    foreach (var item in list)
{
    item.OutpassState = "Expired";
    item.Status = "Completed";

    if (item.LeaveRequestId > 0)
    {
        var leave = await _context.LeaveRequests
            .FindAsync(item.LeaveRequestId);

        if (leave != null)
        {
            leave.Status = "Completed";
        }
    }
}

    await _context.SaveChangesAsync();

    return Ok();
}
[HttpGet("parent/{parentUserId}")]
public IActionResult GetParentOutpasses(string parentUserId)
{
    var parent = _context.Users
        .FirstOrDefault(x => x.UserId == parentUserId);

    if (parent == null)
        return NotFound("Parent not found");

    if (string.IsNullOrEmpty(parent.StudentId))
        return NotFound("Student not linked");

    var outpasses = _context.Outpasses
        .Where(x => x.StudentId == parent.StudentId)
        .OrderByDescending(x => x.Id)
        .ToList();

    return Ok(outpasses);
}
[HttpPut("cancel/{id}")]
public async Task<IActionResult> Cancel(int id)
{
    var outpass = await _context.Outpasses.FindAsync(id);

    if (outpass == null)
        return NotFound();

    if (outpass.Status != "Pending")
        return BadRequest("Only pending outpasses can be cancelled.");

    outpass.Status = "Cancelled";
outpass.OutpassState = "Cancelled";

    await _context.SaveChangesAsync();

    await _hub.Clients.All.SendAsync(
        "OutpassUpdated",
        outpass.StudentId
    );

    return Ok(new
    {
        Message = "Outpass Cancelled"
    });
}
}