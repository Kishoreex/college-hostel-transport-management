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
    if (leave.ApprovalStage == "None")
    {
        leave.Status =
            "Not Accepted By Class Incharge";
    }
    else if (
        leave.ApprovalStage == "FirstApproved"
    )
    {
        leave.Status =
            "Not Accepted By Hostel Incharge";
    }
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

    // Fallback to numeric database ID
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
    // GET ACTUAL ROLE
    // =====================================================

    var role =
        staffUser.Role?.Name?.Trim()
        ?? "";

    var approverName =
        staffUser.FullName;

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
    // Management can directly final approve
    // =====================================================

    if (isManagement)
    {
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
    // Principal can directly final approve
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
        return StatusCode(
            403,
            $"Role '{role}' is not allowed to approve leaves."
        );
    }

    // =====================================================
    // IF FINAL APPROVED + OUT CAMPUS
    // CREATE OUTPASS
    // =====================================================

    if (
        leave.Status == "Approved" &&
        leave.Campus.Equals(
            "Out Campus",
            StringComparison.OrdinalIgnoreCase
        )
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
                    "Active",

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

    return Ok(new
    {
        Message =
            $"Leave approved by {approverName}",

        ApprovalStage =
            leave.ApprovalStage,

        Status =
            leave.Status,

        ApprovedBy =
            approverName
    });
}
   [HttpPost("reject/{id}")]
public async Task<IActionResult> Reject(
    int id,
    [FromBody] RejectLeaveDto dto)
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
        int.TryParse(
            nameIdentifier,
            out var databaseUserId
        )
    )
    {
        staffUser = await _context.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(
                x => x.Id == databaseUserId
            );
    }

    if (staffUser == null)
    {
        return StatusCode(
            403,
            "Logged-in staff user could not be identified."
        );
    }

    // =====================================================
    // ROLE
    // =====================================================

    var role =
        staffUser.Role?.Name?.Trim()
        ?? "";

    var rejectorName =
        staffUser.FullName;

    // =====================================================
    // OLD RECORD FIX
    // =====================================================

    if (string.IsNullOrWhiteSpace(
        leave.ApprovalStage))
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

    var isPrincipal =
        role.Equals(
            "Principal",
            StringComparison.OrdinalIgnoreCase
        );

    var isHostelIncharge =
        role.Equals(
            "Hostel Incharge",
            StringComparison.OrdinalIgnoreCase
        );

    var isClassIncharge =
        role.Equals(
            "Class Incharge",
            StringComparison.OrdinalIgnoreCase
        );

    // =====================================================
    // WHO CAN REJECT
    // =====================================================

    bool canReject = false;

    if (isManagement)
    {
        canReject =
            stage != "FinalApproved";
    }
    else if (isPrincipal)
    {
        canReject =
            stage != "FinalApproved";
    }
    else if (isHostelIncharge)
    {
        canReject =
            stage == "None" ||
            stage == "FirstApproved";
    }
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

    leave.RejectedBy =
        $"{rejectorName} — {role}";

    leave.ApprovedDate =
        DateTime.UtcNow;

    // =====================================================
    // ACTIVITY LOG
    // =====================================================

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

    return Ok(new
    {
        Message =
            "Leave Rejected",

        RejectedBy =
            rejectorName,

        Role =
            role,

        RejectReason =
            dto.RejectReason
    });
}
[HttpGet("history")]
public async Task<IActionResult> GetHistory()
{
    try
    {
        // =====================================================
        // 1. UPDATE EXPIRED PENDING LEAVES
        // =====================================================

        var now = DateTime.Now;

        var pendingLeaves = await _context.LeaveRequests
            .Where(x => x.Status == "Pending")
            .ToListAsync();

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
                if (leave.ApprovalStage == "None")
                {
                    leave.Status =
                        "Not Accepted By Class Incharge";
                }
                else if (
                    leave.ApprovalStage == "FirstApproved"
                )
                {
                    leave.Status =
                        "Not Accepted By Hostel Incharge";
                }
            }
        }

        await _context.SaveChangesAsync();


        // =====================================================
        // 2. GET LOGGED-IN USER
        // =====================================================

        var userId =
            User.FindFirst(ClaimTypes.Name)?.Value
            ?? User.FindFirst("userId")?.Value
            ?? User.FindFirst("UserId")?.Value;

        var nameIdentifier =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        User? staffUser = null;


        // Try UserId from JWT
        if (!string.IsNullOrWhiteSpace(userId))
        {
            staffUser = await _context.Users
                .Include(x => x.Role)
                .FirstOrDefaultAsync(
                    x => x.UserId == userId
                );
        }


        // Fallback to database ID
        if (
            staffUser == null &&
            int.TryParse(
                nameIdentifier,
                out var databaseUserId
            )
        )
        {
            staffUser = await _context.Users
                .Include(x => x.Role)
                .FirstOrDefaultAsync(
                    x => x.Id == databaseUserId
                );
        }


        if (staffUser == null)
        {
            return StatusCode(
                403,
                "Logged-in staff user could not be identified."
            );
        }


        // =====================================================
        // 3. GET ROLE
        // =====================================================

        var role =
            staffUser.Role?.Name?.Trim() ?? "";


        Console.WriteLine(
            "========== LEAVE HISTORY =========="
        );

        Console.WriteLine(
            $"USER        : [{staffUser.UserId}]"
        );

        Console.WriteLine(
            $"NAME        : [{staffUser.FullName}]"
        );

        Console.WriteLine(
            $"ROLE        : [{role}]"
        );

        Console.WriteLine(
            $"COLLEGE ID  : [{staffUser.CollegeId}]"
        );

        Console.WriteLine(
            $"YEAR        : [{staffUser.AssignedYear}]"
        );


        // =====================================================
        // 4. ROLE CHECK
        // =====================================================

        var isManagement =
            role.Equals(
                "Management",
                StringComparison.OrdinalIgnoreCase
            );

        var isSystemAdmin =
            role.Equals(
                "System Admin",
                StringComparison.OrdinalIgnoreCase
            );

        var isAdmin =
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
        // 5. BASE QUERY
        // =====================================================

        var query =
            _context.LeaveRequests
                .AsQueryable();


        // =====================================================
        // 6. MANAGEMENT / ADMIN
        // ALL COLLEGES + ALL YEARS
        // =====================================================

        if (
            isManagement ||
            isSystemAdmin ||
            isAdmin
        )
        {
            Console.WriteLine(
                "LEAVE HISTORY ACCESS: ALL COLLEGES / ALL YEARS"
            );
        }


        // =====================================================
        // 7. CLASS INCHARGE
        // ASSIGNED COLLEGE + ASSIGNED YEAR
        // =====================================================

        else if (isClassIncharge)
        {
            Console.WriteLine(
                "LEAVE HISTORY ACCESS: CLASS INCHARGE"
            );


            if (!staffUser.CollegeId.HasValue)
            {
                return StatusCode(
                    403,
                    "Class Incharge has no CollegeId assigned."
                );
            }


            if (
                string.IsNullOrWhiteSpace(
                    staffUser.AssignedYear
                )
            )
            {
                return StatusCode(
                    403,
                    "Class Incharge has no AssignedYear."
                );
            }


            // -------------------------------------------------
            // GET ASSIGNED COLLEGE NAME
            // -------------------------------------------------

            var collegeName =
                await _context.Colleges
                    .Where(c =>
                        c.Id ==
                        staffUser.CollegeId.Value
                    )
                    .Select(c => c.Name)
                    .FirstOrDefaultAsync();


            if (string.IsNullOrWhiteSpace(collegeName))
            {
                return StatusCode(
                    403,
                    "Assigned college could not be found."
                );
            }


            var normalizedCollege =
                collegeName
                    .Trim()
                    .ToLower();


            // -------------------------------------------------
            // NORMALIZE ASSIGNED YEAR
            // -------------------------------------------------

            var rawYear =
                staffUser.AssignedYear
                    .Trim()
                    .ToLower();


            string normalizedYear;


            if (
                rawYear == "4th year" ||
                rawYear == "final year" ||
                rawYear == "4th"
            )
            {
                normalizedYear = "final year";
            }
            else if (
                rawYear == "intern" ||
                rawYear == "internship"
            )
            {
                normalizedYear = "internship";
            }
            else
            {
                normalizedYear = rawYear;
            }


            Console.WriteLine(
                $"CLASS COLLEGE : [{collegeName}]"
            );

            Console.WriteLine(
                $"CLASS YEAR    : [{normalizedYear}]"
            );


            // -------------------------------------------------
            // FILTER:
            // COLLEGE + YEAR
            // -------------------------------------------------

            query = query.Where(x =>
                _context.StudentRegistrations.Any(s =>
                    s.StudentId == x.StudentId

                    &&

                    s.CollegeName != null

                    &&

                    s.CollegeName
                        .Trim()
                        .ToLower()
                        == normalizedCollege

                    &&

                    s.Year != null

                    &&

                    (
                        // Exact match
                        s.Year
                            .Trim()
                            .ToLower()
                            == normalizedYear

                        ||

                        // Final Year aliases
                        (
                            normalizedYear == "final year"
                            &&
                            (
                                s.Year
                                    .Trim()
                                    .ToLower()
                                    == "4th year"

                                ||

                                s.Year
                                    .Trim()
                                    .ToLower()
                                    == "final year"
                            )
                        )

                        ||

                        // Internship aliases
                        (
                            normalizedYear == "internship"
                            &&
                            (
                                s.Year
                                    .Trim()
                                    .ToLower()
                                    == "intern"

                                ||

                                s.Year
                                    .Trim()
                                    .ToLower()
                                    == "internship"
                            )
                        )
                    )
                )
            );
        }


        // =====================================================
        // 8. HOSTEL INCHARGE
        // ASSIGNED COLLEGE + ALL YEARS
        // =====================================================

        else if (isHostelIncharge)
        {
            Console.WriteLine(
                "LEAVE HISTORY ACCESS: HOSTEL INCHARGE"
            );


            if (!staffUser.CollegeId.HasValue)
            {
                return StatusCode(
                    403,
                    "Hostel Incharge has no CollegeId assigned."
                );
            }


            // -------------------------------------------------
            // GET ASSIGNED COLLEGE
            // -------------------------------------------------

            var collegeName =
                await _context.Colleges
                    .Where(c =>
                        c.Id ==
                        staffUser.CollegeId.Value
                    )
                    .Select(c => c.Name)
                    .FirstOrDefaultAsync();


            if (string.IsNullOrWhiteSpace(collegeName))
            {
                return StatusCode(
                    403,
                    "Assigned college could not be found."
                );
            }


            var normalizedCollege =
                collegeName
                    .Trim()
                    .ToLower();


            // -------------------------------------------------
            // FILTER:
            // COLLEGE ONLY
            // ALL YEARS
            // -------------------------------------------------

            query = query.Where(x =>
                _context.StudentRegistrations.Any(s =>
                    s.StudentId == x.StudentId

                    &&

                    s.CollegeName != null

                    &&

                    s.CollegeName
                        .Trim()
                        .ToLower()
                        == normalizedCollege
                )
            );


            Console.WriteLine(
                $"HOSTEL COLLEGE : [{collegeName}]"
            );
        }


        // =====================================================
        // 9. PRINCIPAL
        // ASSIGNED COLLEGE + ALL YEARS
        // =====================================================

        else if (isPrincipal)
        {
            Console.WriteLine(
                "LEAVE HISTORY ACCESS: PRINCIPAL"
            );


            if (!staffUser.CollegeId.HasValue)
            {
                return StatusCode(
                    403,
                    "Principal has no CollegeId assigned."
                );
            }


            // -------------------------------------------------
            // GET ASSIGNED COLLEGE
            // -------------------------------------------------

            var collegeName =
                await _context.Colleges
                    .Where(c =>
                        c.Id ==
                        staffUser.CollegeId.Value
                    )
                    .Select(c => c.Name)
                    .FirstOrDefaultAsync();


            if (string.IsNullOrWhiteSpace(collegeName))
            {
                return StatusCode(
                    403,
                    "Assigned college could not be found."
                );
            }


            var normalizedCollege =
                collegeName
                    .Trim()
                    .ToLower();


            // -------------------------------------------------
            // FILTER:
            // COLLEGE ONLY
            // ALL YEARS
            // -------------------------------------------------

            query = query.Where(x =>
                _context.StudentRegistrations.Any(s =>
                    s.StudentId == x.StudentId

                    &&

                    s.CollegeName != null

                    &&

                    s.CollegeName
                        .Trim()
                        .ToLower()
                        == normalizedCollege
                )
            );


            Console.WriteLine(
                $"PRINCIPAL COLLEGE : [{collegeName}]"
            );
        }


        // =====================================================
        // 10. UNKNOWN ROLE
        // =====================================================

        else
        {
            return StatusCode(
                403,
                $"Role '{role}' is not allowed to view leave history."
            );
        }


        // =====================================================
        // 11. HISTORY STATUS
        // =====================================================

        query = query.Where(x =>
            x.Status == "Approved" ||
            x.Status == "Completed" ||
            x.Status == "Expired" ||
            x.Status == "Cancelled" ||
            x.Status == "Rejected" ||
            x.Status == "Not Accepted By Hostel Incharge" ||
            x.Status == "Not Accepted By Class Incharge"
        );


        // =====================================================
        // 12. GET HISTORY
        // =====================================================

        var leaves =
            await query
                .OrderByDescending(
                    x => x.CreatedDate
                )
                .ToListAsync();


        // =====================================================
        // 13. BUILD HISTORY RESPONSE
        // =====================================================

        var history = leaves.Select(leave =>
        {
            var outpass =
                _context.Outpasses
                    .FirstOrDefault(o =>
                        o.LeaveRequestId ==
                        leave.Id
                    );


            return new
            {
                leave.Id,
                leave.StudentId,
                leave.StudentName,
                leave.Gender,
                leave.LeaveType,
                leave.Campus,

                College =
                    leave.CollegeName,

                leave.Department,
                leave.Year,
                leave.Reason,
                leave.Destination,
                leave.FromDate,
                leave.ToDate,
                leave.ExitTime,
                leave.ReturnTime,
                leave.Status,

                // =============================================
                // APPROVAL FLOW
                // =============================================

                ApprovalStage =
                    leave.ApprovalStage,

                FirstApprovedBy =
                    leave.FirstApprovedBy,

                SecondApprovedBy =
                    leave.SecondApprovedBy,

                FinalApprovedBy =
                    leave.FinalApprovedBy,

                ApprovedBy =
                    leave.ApprovedBy,

                ApprovedDate =
                    leave.ApprovedDate,

                // =============================================
                // REJECTION
                // =============================================

                RejectReason =
                    leave.RejectReason,

                RejectedBy =
                    leave.RejectedBy,

                // =============================================
                // OUTPASS DETAILS
                // =============================================

                ActualExitTime =
                    outpass?.ActualExitTime,

                ActualReturnTime =
                    outpass?.ActualReturnTime,

                EarlyExitMinutes =
                    outpass?.EarlyExitMinutes ?? 0,

                LateMinutes =
                    outpass?.LateMinutes ?? 0
            };
        })
        .ToList();


        Console.WriteLine(
            $"LEAVE HISTORY COUNT: {history.Count}"
        );


        return Ok(history);
    }
    catch (Exception ex)
    {
        Console.WriteLine(
            "LEAVE HISTORY ERROR:"
        );

        Console.WriteLine(
            ex.ToString()
        );

        return StatusCode(
            500,
            ex.Message
        );
    }
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
