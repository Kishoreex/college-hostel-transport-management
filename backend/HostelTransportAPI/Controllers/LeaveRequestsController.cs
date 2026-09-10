using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;
using HostelTransportAPI.DTOs;
using HostelTransportAPI.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Hubs;
namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaveRequestsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
private readonly IHubContext<NotificationHub> _hub;

  public LeaveRequestsController(
    ApplicationDbContext context,
    IHubContext<NotificationHub> hub)
{
    _context = context;
    _hub = hub;
}

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateLeaveRequestDto dto)
    {
       var hasActiveLeave = _context.LeaveRequests.Any(x =>
    x.StudentId == dto.StudentId &&
    (
        x.Status == "Pending" ||
        x.Status == "Approved"
    )
);

if (hasActiveLeave)
{
    return BadRequest(
        "Student already has an active leave request."
    );
}
       var leaveRequest = new LeaveRequest
{
    StudentId = dto.StudentId,
    StudentName = dto.StudentName,

   LeaveNumber = $"LV-{DateTime.Now:yyyyMMddHHmmss}",

    LeaveType = dto.LeaveType,

    Campus = dto.Campus,

    Department = dto.Department,

    Gender = dto.Gender,

    Year = dto.Year,

    FromDate = dto.FromDate,

    ToDate = dto.ToDate,

    Reason = dto.Reason,

Destination = dto.Destination,
    ExitTime = dto.ExitTime,

ReturnTime = dto.ReturnTime,
    Status = "Pending",

    CreatedDate = DateTime.Now
};

        _context.LeaveRequests.Add(leaveRequest);
        var systemAdmins = _context.Users
    .Where(x => x.IsSystemAdmin)
    .ToList();

foreach (var admin in systemAdmins)
{
    _context.Notifications.Add(
        new Notification
        {
            UserId = admin.Id,
            Title = "New Leave Request",
            Message = $"{dto.StudentId} submitted leave request",
            Type = "Leave",
            IsRead = false,
            CreatedAt = DateTime.Now
        });
}

      await _context.SaveChangesAsync();

await _hub.Clients.All.SendAsync(
    "LeaveCreated"
);
        return Ok(leaveRequest);
    }

[HttpGet]
public async Task<IActionResult> GetAll(
    [FromQuery] string? college)
{
    var now = DateTime.Now;

    var query = _context.LeaveRequests
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(college))
    {
        query = query.Where(x =>
            _context.StudentRegistrations.Any(s =>
                s.StudentId == x.StudentId &&
                s.CollegeName == college
            )
        );
    }

    var leaves = await query.ToListAsync();

    foreach (var leave in leaves)
    {
        if (leave.Status == "Pending")
        {
            DateTime lastApprovalTime;

            if (
                leave.Campus == "Out Campus" &&
                leave.FromDate.Date == leave.ToDate.Date &&
                !string.IsNullOrWhiteSpace(leave.ReturnTime)
            )
            {
                lastApprovalTime =
                    leave.ToDate.Date +
                    TimeSpan.Parse(leave.ReturnTime);
            }
            else
            {
                lastApprovalTime =
                    leave.ToDate.Date
                        .AddHours(23)
                        .AddMinutes(59)
                        .AddSeconds(59);
            }

            if (now > lastApprovalTime)
            {
                leave.Status = "Not Accepted By Hostel Incharge";
            }
        }

        if (leave.Status == "Approved")
        {
            DateTime leaveEnd;

            if (
                leave.FromDate.Date == leave.ToDate.Date &&
                !string.IsNullOrWhiteSpace(leave.ReturnTime)
            )
            {
                leaveEnd =
                    leave.ToDate.Date +
                    TimeSpan.Parse(leave.ReturnTime);
            }
            else
            {
                leaveEnd =
                    leave.ToDate.Date
                        .AddHours(23)
                        .AddMinutes(59)
                        .AddSeconds(59);
            }

            if (now > leaveEnd)
            {
                leave.Status = "Completed";
            }
        }
    }

    await _context.SaveChangesAsync();

    return Ok(
        query
            .OrderByDescending(x => x.CreatedDate)
            .ToList()
    );
}
    [HttpPost("approve/{id}")]
    public async Task<IActionResult> Approve(int id)
    {
        var leave = await _context.LeaveRequests.FindAsync(id);

        if (leave == null)
            return NotFound("Leave Request Not Found");

        leave.Status = "Approved";
        leave.ApprovedDate = DateTime.UtcNow;
        leave.ApprovedBy = "Admin";
        _context.ActivityLogs.Add(
    new ActivityLog
    {
        UserId = 6,
        UserName = "Main Administrator",
        Action = $"Approved leave request {leave.Id}",
        Module = "Leave",
        CreatedAt = DateTime.Now
    });
        _context.ActivityLogs.Add(
    new ActivityLog
    {
        UserId = 6,
        UserName = "Main Administrator",
        Action = $"Approved leave request #{leave.Id}",
        Module = "Leave",
        CreatedAt = DateTime.Now
    });
       if (leave.Campus == "Out Campus")
{DateTime validFrom;
DateTime validTo;

if (leave.FromDate.Date == leave.ToDate.Date)
{
    // Same-day leave
    validFrom = leave.FromDate.Date + TimeSpan.Parse(leave.ExitTime);

    validTo = leave.ToDate.Date + TimeSpan.Parse(leave.ReturnTime);
}
else
{
    // Multiple-day leave
    validFrom = leave.FromDate.Date;

    validTo = leave.ToDate.Date
    .AddHours(23)
    .AddMinutes(59)
    .AddSeconds(59);
}
  var outpass = new Outpass
{
    OutpassNumber = $"OP{DateTime.Now:yyyyMMddHHmmss}",

    StudentId = leave.StudentId,

    StudentName = leave.StudentName,

    Gender = leave.Gender,

    LeaveRequestId = leave.Id,

   ValidFrom = validFrom,

ValidTo = validTo,

    Status = "Approved",

   OutpassState = "Active",

    Reason = leave.Reason,

    Destination = leave.Destination,

    TimeOut = string.IsNullOrWhiteSpace(leave.ExitTime)
    ? "00:00"
    : leave.ExitTime,

ReturnTime = string.IsNullOrWhiteSpace(leave.ReturnTime)
    ? "23:59"
    : leave.ReturnTime
};
    _context.Outpasses.Add(outpass);

    _context.ActivityLogs.Add(
        new ActivityLog
        {
            UserId = 6,
            UserName = "Main Administrator",
            Action = $"Created outpass {outpass.OutpassNumber}",
            Module = "Outpass",
            CreatedAt = DateTime.Now
        });
}

       await _context.SaveChangesAsync();

await _hub.Clients.All.SendAsync(
    "LeaveUpdated",
    leave.StudentId
);
        return Ok(new
        {
            Message = "Leave Approved"
        });
    }

    [HttpPost("reject/{id}")]
    public async Task<IActionResult> Reject(
    int id,
    RejectLeaveDto dto
)
    {
        var leave = await _context.LeaveRequests.FindAsync(id);

        if (leave == null)
            return NotFound("Leave Request Not Found");

        leave.Status = "Rejected";
        leave.RejectReason = dto.RejectReason;
        leave.ApprovedDate = DateTime.UtcNow;
        leave.ApprovedBy = "Admin";
        _context.ActivityLogs.Add(
    new ActivityLog
    {
        UserId = 6,
        UserName = "Main Administrator",
        Action = $"Rejected leave request #{leave.Id}",
        Module = "Leave",
        CreatedAt = DateTime.Now
    });

      await _context.SaveChangesAsync();

await _hub.Clients.All.SendAsync(
    "LeaveUpdated",
    leave.StudentId
);
        return Ok(new
        {
            Message = "Leave Rejected"
        });
    }
[HttpGet("history")]
public IActionResult GetHistory()
{
    var now = DateTime.Now;

var pendingLeaves = _context.LeaveRequests
    .Where(x => x.Status == "Pending")
    .ToList();

foreach (var leave in pendingLeaves)
{
    DateTime expiryTime;

    if (
        leave.Campus == "Out Campus" &&
        leave.FromDate.Date == leave.ToDate.Date &&
        !string.IsNullOrWhiteSpace(leave.ReturnTime)
    )
    {
        expiryTime =
            leave.ToDate.Date +
            TimeSpan.Parse(leave.ReturnTime);
    }
    else
    {
        expiryTime =
            leave.ToDate.Date
                .AddHours(23)
                .AddMinutes(59)
                .AddSeconds(59);
    }

    if (now > expiryTime)
    {
        leave.Status = "Not Accepted By Hostel Incharge";
    }
}

_context.SaveChanges();
    var history =
        (from leave in _context.LeaveRequests

         join outpass in _context.Outpasses
         on leave.Id equals outpass.LeaveRequestId
         into op

         from outpass in op.DefaultIfEmpty()

    where leave.Status == "Approved"
   || leave.Status == "Completed"
   || leave.Status == "Expired"
   || leave.Status == "Cancelled"
   || leave.Status == "Rejected"
   || leave.Status == "Not Accepted By Hostel Incharge"
         orderby leave.CreatedDate descending

         select new
         {
             leave.Id,
             leave.StudentId,
             leave.StudentName,
             leave.Gender,
             leave.LeaveType,
             leave.Campus,
             Reason = leave.Reason,
Destination = leave.Destination,
             leave.FromDate,
             leave.ToDate,
             leave.ExitTime,
             leave.ReturnTime,
             leave.Status,

             ActualExitTime =
                 outpass == null
                     ? null
                     : outpass.ActualExitTime,

             ActualReturnTime =
                 outpass == null
                     ? null
                     : outpass.ActualReturnTime,

             EarlyExitMinutes =
                 outpass == null
                     ? 0
                     : outpass.EarlyExitMinutes,

             LateMinutes =
                 outpass == null
                     ? 0
                     : outpass.LateMinutes
         })
         .ToList();

    return Ok(history);
}
[HttpGet("parent/{parentUserId}")]
public IActionResult GetParentLeaves(string parentUserId)
{
    var parent = _context.Users
        .FirstOrDefault(x => x.UserId == parentUserId);

    if (parent == null)
        return NotFound("Parent not found");

    if (string.IsNullOrWhiteSpace(parent.StudentId))
        return BadRequest("No student linked.");

    var leaves = _context.LeaveRequests
        .Where(x => x.StudentId == parent.StudentId)
        .OrderByDescending(x => x.CreatedDate)
        .ToList();

    return Ok(leaves);
}
[HttpPost("cancel/{id}")]
public async Task<IActionResult> Cancel(int id)
{
    var leave = await _context.LeaveRequests.FindAsync(id);

    if (leave == null)
        return NotFound();

    if (leave.Status != "Pending")
        return BadRequest("Only pending requests can be cancelled.");

    leave.Status = "Cancelled";

    await _context.SaveChangesAsync();

    await _hub.Clients.All.SendAsync(
        "LeaveUpdated",
        leave.StudentId
    );

    return Ok(new
    {
        Message = "Leave Cancelled"
    });
}
}
