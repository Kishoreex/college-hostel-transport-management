using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;
using HostelTransportAPI.DTOs;
using HostelTransportAPI.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Hubs;
using System.Security.Claims;

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
CollegeName = dto.CollegeName,
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
                leave.Status = "Not Accepted By Class Incharge";
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
    var leave = await _context.LeaveRequests
        .FirstOrDefaultAsync(x => x.Id == id);

    if (leave == null)
        return NotFound("Leave Request Not Found");


    // =====================================================
    // GET LOGGED-IN USER
    // =====================================================

    var userId =
        User.FindFirst(ClaimTypes.Name)?.Value
        ?? User.FindFirst("userId")?.Value
        ?? User.FindFirst("UserId")?.Value;

    var nameIdentifier =
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value;


    User? staffUser = null;


    // First try UserId from JWT
    if (!string.IsNullOrWhiteSpace(userId))
    {
        staffUser = await _context.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.UserId == userId);
    }


    // Fallback: database ID
    if (
        staffUser == null &&
        int.TryParse(nameIdentifier, out var databaseUserId)
    )
    {
        staffUser = await _context.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == databaseUserId);
    }


    if (staffUser == null)
    {
        return StatusCode(
            403,
            "Logged-in staff user could not be identified."
        );
    }


    // =====================================================
    // ACTUAL DATABASE ROLE
    // =====================================================

    var role =
        staffUser.Role?.Name?.Trim()
        ?? "";

    var approverName =
        staffUser.FullName;


    // =====================================================
    // LOG
    // =====================================================

    Console.WriteLine("========== LEAVE APPROVAL ==========");
    Console.WriteLine($"Database User Id : {staffUser.Id}");
    Console.WriteLine($"Database UserId   : {staffUser.UserId}");
    Console.WriteLine($"Staff Name        : {staffUser.FullName}");
    Console.WriteLine($"Database Role     : {role}");
    Console.WriteLine($"Leave Id          : {leave.Id}");
    Console.WriteLine($"Current Stage     : {leave.ApprovalStage}");


    // =====================================================
    // OLD RECORD FIX
    // =====================================================

    if (string.IsNullOrWhiteSpace(leave.ApprovalStage))
    {
        leave.ApprovalStage = "None";
    }

    var stage =
        leave.ApprovalStage.Trim();


    // =====================================================
    // ROLE CHECK
    // =====================================================

    var isManagement =
        role.Equals(
            "Management",
            StringComparison.OrdinalIgnoreCase
        )
        ||
        role.Equals(
            "System Admin",
            StringComparison.OrdinalIgnoreCase
        )
        ||
        role.Equals(
            "Admin",
            StringComparison.OrdinalIgnoreCase
        );


    var isClassIncharge =
        role.Equals(
            "Class Incharge",
            StringComparison.OrdinalIgnoreCase
        );


    var isHostelIncharge =
        role.Equals(
            "Hostel Incharge",
            StringComparison.OrdinalIgnoreCase
        );


    var isPrincipal =
        role.Equals(
            "Principal",
            StringComparison.OrdinalIgnoreCase
        );


    // =====================================================
    // MANAGEMENT
    //
    // Management can directly approve.
    //
    // Any unfinished stage
    //        ↓
    // FinalApproved
    // =====================================================

    if (isManagement)
    {
        if (stage == "FinalApproved")
        {
            return BadRequest(
                "Leave is already finally approved."
            );
        }

        leave.ApprovalStage =
            "FinalApproved";

        leave.FinalApprovedBy =
            approverName;

        leave.Status =
            "Approved";

        leave.ApprovedDate =
            DateTime.UtcNow;

        leave.ApprovedBy =
            approverName;
    }


    // =====================================================
    // PRINCIPAL
    //
    // Principal can directly approve ANY unfinished stage.
    //
    // None
    // FirstApproved
    // SecondApproved
    //        ↓
    // FinalApproved
    // =====================================================

    else if (isPrincipal)
    {
        if (stage == "FinalApproved")
        {
            return BadRequest(
                "Leave is already finally approved."
            );
        }

        leave.ApprovalStage =
            "FinalApproved";

        leave.FinalApprovedBy =
            approverName;

        leave.Status =
            "Approved";

        leave.ApprovedDate =
            DateTime.UtcNow;

        leave.ApprovedBy =
            approverName;
    }


    // =====================================================
    // HOSTEL INCHARGE
    //
    // None
    //    ↓
    // SecondApproved
    //
    // FirstApproved
    //    ↓
    // SecondApproved
    // =====================================================

    else if (isHostelIncharge)
    {
        if (
            stage != "None" &&
            stage != "FirstApproved"
        )
        {
            return Forbid();
        }

        leave.ApprovalStage =
            "SecondApproved";

        leave.SecondApprovedBy =
            approverName;
    }


    // =====================================================
    // CLASS INCHARGE
    //
    // None
    //    ↓
    // FirstApproved
    // =====================================================

    else if (isClassIncharge)
    {
        if (stage != "None")
        {
            return Forbid();
        }

        leave.ApprovalStage =
            "FirstApproved";

        leave.FirstApprovedBy =
            approverName;
    }


    // =====================================================
    // UNKNOWN ROLE
    // =====================================================

    else
    {
        Console.WriteLine(
            $"LEAVE APPROVAL DENIED. ROLE = [{role}]"
        );

        return StatusCode(
            403,
            $"Role '{role}' is not allowed to approve leave requests."
        );
    }


    // =====================================================
    // FINAL APPROVAL ACTIONS
    //
    // Only when leave becomes FinalApproved
    // =====================================================

    if (
        leave.ApprovalStage == "FinalApproved" &&
        leave.Status != "Approved"
    )
    {
        leave.Status =
            "Approved";

        leave.ApprovedDate =
            DateTime.UtcNow;

        leave.ApprovedBy =
            approverName;
    }


    // =====================================================
    // CREATE OUTPASS ONLY AFTER FINAL APPROVAL
    //
    // Same existing behavior as your current system.
    // =====================================================

    if (
        leave.ApprovalStage == "FinalApproved" &&
        leave.Status == "Approved" &&
        leave.Campus == "Out Campus"
    )
    {
        var existingOutpass =
            await _context.Outpasses
                .FirstOrDefaultAsync(
                    x => x.LeaveRequestId == leave.Id
                );

        if (existingOutpass == null)
        {
            DateTime validFrom;
            DateTime validTo;


            if (leave.FromDate.Date == leave.ToDate.Date)
            {
                validFrom =
                    leave.FromDate.Date +
                    TimeSpan.Parse(leave.ExitTime);

                validTo =
                    leave.ToDate.Date +
                    TimeSpan.Parse(leave.ReturnTime);
            }
            else
            {
                validFrom =
                    leave.FromDate.Date;

                validTo =
                    leave.ToDate.Date
                        .AddHours(23)
                        .AddMinutes(59)
                        .AddSeconds(59);
            }


            var outpass = new Outpass
            {
                OutpassNumber =
                    $"OP{DateTime.Now:yyyyMMddHHmmss}",

                StudentId =
                    leave.StudentId,

                StudentName =
                    leave.StudentName,

                CollegeName =
                    leave.CollegeName,

                Gender =
                    leave.Gender,

                LeaveRequestId =
                    leave.Id,

                ValidFrom =
                    validFrom,

                ValidTo =
                    validTo,

                Status =
                    "Approved",

                ApprovalStage =
                    "FinalApproved",

                FirstApprovedBy =
                    leave.FirstApprovedBy,

                SecondApprovedBy =
                    leave.SecondApprovedBy,

                FinalApprovedBy =
                    leave.FinalApprovedBy,

                OutpassState =
                    "Waiting For Exit",

                Reason =
                    leave.Reason,

                Destination =
                    leave.Destination,

                TimeOut =
                    string.IsNullOrWhiteSpace(
                        leave.ExitTime
                    )
                    ? "00:00"
                    : leave.ExitTime,

                ReturnTime =
                    string.IsNullOrWhiteSpace(
                        leave.ReturnTime
                    )
                    ? "23:59"
                    : leave.ReturnTime
            };


            _context.Outpasses.Add(outpass);


            _context.ActivityLogs.Add(
                new ActivityLog
                {
                    UserId =
                        staffUser.Id,

                    UserName =
                        approverName,

                    Action =
                        $"Created outpass {outpass.OutpassNumber}",

                    Module =
                        "Outpass",

                    CreatedAt =
                        DateTime.Now
                }
            );
        }
    }


    // =====================================================
    // ACTIVITY LOG
    // =====================================================

    _context.ActivityLogs.Add(
        new ActivityLog
        {
            UserId =
                staffUser.Id,

            UserName =
                approverName,

            Action =
                $"Approved leave request #{leave.Id} at {leave.ApprovalStage}",

            Module =
                "Leave",

            CreatedAt =
                DateTime.Now
        }
    );


    await _context.SaveChangesAsync();


    await _hub.Clients.All.SendAsync(
        "LeaveUpdated",
        leave.StudentId
    );


    Console.WriteLine(
        $"LEAVE APPROVAL SUCCESS: {approverName} -> {leave.ApprovalStage}"
    );


    return Ok(
        new
        {
            Message =
                $"Leave approved by {approverName}",

            ApprovalStage =
                leave.ApprovalStage,

            Status =
                leave.Status,

            ApprovedBy =
                approverName
        }
    );
}
    
[HttpPost("reject/{id}")]
public async Task<IActionResult> Reject(
    int id,
    RejectLeaveDto dto)
{
    var leave = await _context.LeaveRequests
        .FirstOrDefaultAsync(x => x.Id == id);

    if (leave == null)
        return NotFound("Leave Request Not Found");


    // =====================================================
    // GET LOGGED-IN USER
    // =====================================================

    var userId =
        User.FindFirst(ClaimTypes.Name)?.Value
        ?? User.FindFirst("userId")?.Value
        ?? User.FindFirst("UserId")?.Value;

    var nameIdentifier =
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value;


    User? staffUser = null;


    if (!string.IsNullOrWhiteSpace(userId))
    {
        staffUser = await _context.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.UserId == userId);
    }


    if (
        staffUser == null &&
        int.TryParse(nameIdentifier, out var databaseUserId)
    )
    {
        staffUser = await _context.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == databaseUserId);
    }


    if (staffUser == null)
    {
        return StatusCode(
            403,
            "Logged-in staff user could not be identified."
        );
    }


    var role =
        staffUser.Role?.Name?.Trim()
        ?? "";

    var rejectorName =
        staffUser.FullName;


    // =====================================================
    // STAGE
    // =====================================================

    if (string.IsNullOrWhiteSpace(leave.ApprovalStage))
    {
        leave.ApprovalStage = "None";
    }

    var stage =
        leave.ApprovalStage.Trim();


    // =====================================================
    // ROLE
    // =====================================================

    var isManagement =
        role.Equals(
            "Management",
            StringComparison.OrdinalIgnoreCase
        )
        ||
        role.Equals(
            "System Admin",
            StringComparison.OrdinalIgnoreCase
        )
        ||
        role.Equals(
            "Admin",
            StringComparison.OrdinalIgnoreCase
        );


    var isClassIncharge =
        role.Equals(
            "Class Incharge",
            StringComparison.OrdinalIgnoreCase
        );


    var isHostelIncharge =
        role.Equals(
            "Hostel Incharge",
            StringComparison.OrdinalIgnoreCase
        );


    var isPrincipal =
        role.Equals(
            "Principal",
            StringComparison.OrdinalIgnoreCase
        );


    // =====================================================
    // REJECTION PERMISSION
    // =====================================================

    bool canReject = false;


    // Management
    if (isManagement)
    {
        canReject =
            stage != "FinalApproved";
    }


    // Principal
    else if (isPrincipal)
    {
        canReject =
            stage != "FinalApproved";
    }


    // Hostel Incharge
    else if (isHostelIncharge)
    {
        canReject =
            stage == "None" ||
            stage == "FirstApproved";
    }


    // Class Incharge
    else if (isClassIncharge)
    {
        canReject =
            stage == "None";
    }


    if (!canReject)
    {
        return Forbid();
    }


    // =====================================================
    // SAVE REJECTION
    // =====================================================

    leave.Status =
        "Rejected";

    leave.RejectReason =
        dto.RejectReason;

    leave.ApprovedDate =
        DateTime.UtcNow;

    leave.ApprovedBy =
        rejectorName;


    _context.ActivityLogs.Add(
        new ActivityLog
        {
            UserId =
                staffUser.Id,

            UserName =
                rejectorName,

            Action =
                $"Rejected leave request #{leave.Id}",

            Module =
                "Leave",

            CreatedAt =
                DateTime.Now
        }
    );


    await _context.SaveChangesAsync();


    await _hub.Clients.All.SendAsync(
        "LeaveUpdated",
        leave.StudentId
    );


    return Ok(
        new
        {
            Message =
                "Leave Rejected",

            RejectedBy =
                rejectorName,

            RejectReason =
                dto.RejectReason
        }
    );
}
[HttpGet("history")]
public IActionResult GetHistory([FromQuery] string? college)
{
    var now = DateTime.Now;

    // ---------------------------------------------------------
    // 1. Update expired pending leaves
    // ---------------------------------------------------------
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
            leave.Status = "Not Accepted By Class Incharge";
        }
    }

    _context.SaveChanges();


    // ---------------------------------------------------------
    // 2. Get leave history
    // ---------------------------------------------------------
    var leaves = _context.LeaveRequests
        .Where(x =>
            x.Status == "Approved" ||
            x.Status == "Completed" ||
            x.Status == "Expired" ||
            x.Status == "Cancelled" ||
            x.Status == "Rejected" ||
            x.Status == "Not Accepted By Class Incharge"
        )
        .OrderByDescending(x => x.CreatedDate)
        .ToList();


    // ---------------------------------------------------------
    // 3. Build result and find college from StudentRegistration
    // ---------------------------------------------------------
  var history = leaves.Select(leave =>
{
    var outpass = _context.Outpasses
        .FirstOrDefault(o =>
            o.LeaveRequestId == leave.Id
        );

    return new
    {
        leave.Id,
        leave.StudentId,
        leave.StudentName,
        leave.Gender,
        leave.LeaveType,
        leave.Campus,

        // GET COLLEGE DIRECTLY FROM LEAVE REQUEST
        College = leave.CollegeName,

        leave.Department,
        leave.Year,
        leave.Reason,
        leave.Destination,
        leave.FromDate,
        leave.ToDate,
        leave.ExitTime,
        leave.ReturnTime,
        leave.Status,

        ActualExitTime =
            outpass?.ActualExitTime,

        ActualReturnTime =
            outpass?.ActualReturnTime,

        EarlyExitMinutes =
            outpass?.EarlyExitMinutes ?? 0,

        LateMinutes =
            outpass?.LateMinutes ?? 0
    };
}).ToList();
    // ---------------------------------------------------------
    // 4. College filtering
    // ---------------------------------------------------------
    // Management:
    // /LeaveRequests/history
    // => ALL COLLEGES
    //
    // College staff:
    // /LeaveRequests/history?college=Madha Dental College & Hospital
    // => ONLY THAT COLLEGE
    // ---------------------------------------------------------

    if (!string.IsNullOrWhiteSpace(college))
    {
        history = history
            .Where(x =>
                x.College.Equals(
                    college,
                    StringComparison.OrdinalIgnoreCase
                )
            )
            .ToList();
    }


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
