using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;
using HostelTransportAPI.Models;
using HostelTransportAPI.DTOs;
using Microsoft.AspNetCore.SignalR;
using HostelTransportAPI.Hubs;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
namespace HostelTransportAPI.Controllers;

using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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
public IActionResult GetAll([FromQuery] string? college)
{
    try
    {
        var now = DateTime.Now;

        var query = _context.Outpasses
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

        var outpasses = query.ToList();

        foreach (var outpass in outpasses)
        {
            if (outpass.Status == "Pending")
            {
                if (now > outpass.ValidTo)
                {
                    outpass.Status = "Not Accepted By Class Incharge";
                }
            }
        }

        _context.SaveChanges();

        return Ok(
            query
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
// Every new outpass starts at the first approval stage.
if (string.IsNullOrWhiteSpace(outpass.ApprovalStage))
{
    outpass.ApprovalStage = "None";
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
    var outpass = await _context.Outpasses
        .FirstOrDefaultAsync(x => x.Id == id);

    if (outpass == null)
        return NotFound();

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

    // Fallback: use numeric database Id from JWT
    if (staffUser == null &&
        int.TryParse(nameIdentifier, out var databaseUserId))
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
    // GET ACTUAL DATABASE ROLE
    // =====================================================

    var role =
        staffUser.Role?.Name?.Trim()
        ?? "";

    var approverName =
        staffUser.FullName;

    Console.WriteLine("========== OUTPASS APPROVAL ==========");
    Console.WriteLine($"Database User Id : {staffUser.Id}");
    Console.WriteLine($"Database UserId   : {staffUser.UserId}");
    Console.WriteLine($"Staff Name        : {staffUser.FullName}");
    Console.WriteLine($"Database Role     : {role}");
    Console.WriteLine($"Outpass Id        : {outpass.Id}");
    Console.WriteLine($"Current Stage     : {outpass.ApprovalStage}");

    // =====================================================
    // FIX OLD RECORDS
    // =====================================================

    if (string.IsNullOrWhiteSpace(outpass.ApprovalStage))
    {
        outpass.ApprovalStage = "None";
    }

    var stage = outpass.ApprovalStage.Trim();

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
    // =====================================================

    if (isManagement)
    {
        outpass.ApprovalStage = "FinalApproved";

        outpass.FinalApprovedBy =
            approverName;

        outpass.Status = "Approved";

        outpass.OutpassState =
            "Waiting For Exit";
    }

    // =====================================================
    // PRINCIPAL
    // Principal can directly approve any unfinished stage.
    // =====================================================

    else if (isPrincipal)
    {
        if (stage == "FinalApproved")
        {
            return BadRequest(
                "Outpass is already finally approved."
            );
        }

        outpass.ApprovalStage =
            "FinalApproved";

        outpass.FinalApprovedBy =
            approverName;

        outpass.Status =
            "Approved";

        outpass.OutpassState =
            "Waiting For Exit";
    }

    // =====================================================
    // HOSTEL INCHARGE
    //
    // None
    //     ↓
    // SecondApproved
    //
    // FirstApproved
    //     ↓
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

        outpass.ApprovalStage =
            "SecondApproved";

        outpass.SecondApprovedBy =
            approverName;
    }

    // =====================================================
    // CLASS INCHARGE
    //
    // None
    //     ↓
    // FirstApproved
    // =====================================================

    else if (isClassIncharge)
    {
        if (stage != "None")
        {
            return Forbid();
        }

        outpass.ApprovalStage =
            "FirstApproved";

        outpass.FirstApprovedBy =
            approverName;
    }

    // =====================================================
    // UNKNOWN ROLE
    // =====================================================

    else
    {
        Console.WriteLine(
            $"OUTPASS APPROVAL DENIED. ROLE = [{role}]"
        );

        return StatusCode(
            403,
            $"Role '{role}' is not allowed to approve outpasses."
        );
    }

    await _context.SaveChangesAsync();

    await _hub.Clients.All.SendAsync(
        "OutpassUpdated",
        outpass.StudentId
    );

    Console.WriteLine(
        $"APPROVAL SUCCESS: {approverName} -> {outpass.ApprovalStage}"
    );

    return Ok(new
    {
        Message =
            $"Outpass approved by {approverName}",

        ApprovalStage =
            outpass.ApprovalStage,

        Status =
            outpass.Status,

        ApprovedBy =
            approverName
    });
}
[HttpPut("reject/{id}")]
public async Task<IActionResult> Reject(
    int id,
    [FromBody] RejectOutpassDto dto)
{
    var outpass = await _context.Outpasses
        .FirstOrDefaultAsync(x => x.Id == id);

    if (outpass == null)
        return NotFound();

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
    // ACTUAL DATABASE ROLE
    // =====================================================

    var role =
        staffUser.Role?.Name?.Trim()
        ?? "";

    var rejectorName =
        staffUser.FullName;

    Console.WriteLine("========== OUTPASS REJECTION ==========");
    Console.WriteLine($"Database User Id : {staffUser.Id}");
    Console.WriteLine($"Database UserId   : {staffUser.UserId}");
    Console.WriteLine($"Staff Name        : {staffUser.FullName}");
    Console.WriteLine($"Database Role     : {role}");
    Console.WriteLine($"Outpass Id        : {outpass.Id}");
    Console.WriteLine($"Current Stage     : {outpass.ApprovalStage}");

    // Old records
    if (string.IsNullOrWhiteSpace(outpass.ApprovalStage))
    {
        outpass.ApprovalStage = "None";
    }

    var stage =
        outpass.ApprovalStage.Trim();

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

    var canReject = false;

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

    outpass.Status =
        "Rejected";

    outpass.RejectReason =
        dto.RejectReason;

  outpass.RejectedBy =
    $"{rejectorName} — {role}";

    await _context.SaveChangesAsync();

    await _hub.Clients.All.SendAsync(
        "OutpassUpdated",
        outpass.StudentId
    );

    return Ok(new
    {
        Message = "Outpass Rejected",

        RejectedBy =
            rejectorName,

        RejectReason =
            dto.RejectReason
    });
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

[HttpGet("history")]
public async Task<IActionResult> GetHistory()
{
    try
    {
        var now = DateTime.Now;

        // =====================================================
        // 1. MARK EXPIRED OUTPASSES
        // =====================================================

        var expiredOutpasses = await _context.Outpasses
            .Where(x =>
                x.ValidTo < now &&
                x.ActualExitTime == null &&
                (
                    x.Status == "Pending" ||
                    x.Status == "Approved" ||
                    x.OutpassState == "Active" ||
                    x.OutpassState == "Waiting For Exit"
                )
            )
            .ToListAsync();

        foreach (var item in expiredOutpasses)
        {
            if (item.Status == "Pending")
            {
                item.Status =
                    "Not Accepted By Class Incharge";
            }
            else
            {
                item.Status = "Completed";
                item.OutpassState = "Expired";
            }
        }

        await _context.SaveChangesAsync();


        // =====================================================
        // 2. GET LOGGED-IN USER
        // =====================================================

        var jwtUserId =
            User.FindFirst(ClaimTypes.Name)?.Value
            ?? User.FindFirst("userId")?.Value
            ?? User.FindFirst("UserId")?.Value;

        var nameIdentifier =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value;


        Console.WriteLine(
            "========== OUTPASS HISTORY REQUEST =========="
        );

        Console.WriteLine(
            $"JWT Name       : [{jwtUserId}]"
        );

        Console.WriteLine(
            $"JWT NameId     : [{nameIdentifier}]"
        );


        User? staffUser = null;


        // =====================================================
        // 3. FIND USER USING UserId
        // =====================================================

        if (!string.IsNullOrWhiteSpace(jwtUserId))
        {
            staffUser = await _context.Users
                .Include(x => x.Role)
                .FirstOrDefaultAsync(
                    x => x.UserId == jwtUserId
                );
        }


        // =====================================================
        // 4. FALLBACK USING DATABASE ID
        // =====================================================

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
            Console.WriteLine(
                "HISTORY ERROR: STAFF USER NOT FOUND"
            );

            return StatusCode(
                403,
                "Logged-in staff user could not be identified."
            );
        }


        // =====================================================
        // 5. GET ROLE
        // =====================================================

        var role =
            staffUser.Role?.Name?.Trim() ?? "";


        Console.WriteLine(
            $"DATABASE USER ID : {staffUser.Id}"
        );

        Console.WriteLine(
            $"DATABASE USER ID : [{staffUser.UserId}]"
        );

        Console.WriteLine(
            $"STAFF NAME       : [{staffUser.FullName}]"
        );

        Console.WriteLine(
            $"ROLE             : [{role}]"
        );

        Console.WriteLine(
            $"COLLEGE ID       : [{staffUser.CollegeId}]"
        );

        Console.WriteLine(
            $"ASSIGNED YEAR    : [{staffUser.AssignedYear}]"
        );


        // =====================================================
        // 6. RESOLVE COLLEGE USING CollegeId
        // =====================================================

        string? staffCollege = null;

        if (
            staffUser.CollegeId.HasValue &&
            staffUser.CollegeId.Value > 0
        )
        {
            staffCollege = await _context.Colleges
                .Where(c =>
                    c.Id == staffUser.CollegeId.Value
                )
                .Select(c => c.Name)
                .FirstOrDefaultAsync();
        }


        Console.WriteLine(
            $"RESOLVED COLLEGE : [{staffCollege}]"
        );


        // =====================================================
        // 7. NORMALIZE ASSIGNED YEAR
        // =====================================================

        var assignedYear =
            staffUser.AssignedYear?.Trim();


        if (
            assignedYear?.Equals(
                "4th Year",
                StringComparison.OrdinalIgnoreCase
            ) == true
        )
        {
            assignedYear = "Final Year";
        }

        if (
            assignedYear?.Equals(
                "Intern",
                StringComparison.OrdinalIgnoreCase
            ) == true
        )
        {
            assignedYear = "Internship";
        }


        Console.WriteLine(
            $"NORMALIZED YEAR  : [{assignedYear}]"
        );


        // =====================================================
        // 8. ROLE CHECK
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
        // 9. BASE QUERY
        // =====================================================

        var query =
            _context.Outpasses.AsQueryable();


        // =====================================================
        // 10. MANAGEMENT
        // ALL COLLEGES / ALL YEARS
        // =====================================================

        if (isManagement)
        {
            Console.WriteLine(
                "HISTORY ACCESS: MANAGEMENT - ALL"
            );
        }


        // =====================================================
        // 11. CLASS INCHARGE
        // COLLEGE + YEAR
        // =====================================================

      else if (isClassIncharge)
{
    Console.WriteLine(
        "========== CLASS INCHARGE HISTORY =========="
    );

    Console.WriteLine(
        $"CLASS INCHARGE USER : [{staffUser.UserId}]"
    );

    Console.WriteLine(
        $"CLASS INCHARGE NAME : [{staffUser.FullName}]"
    );

    Console.WriteLine(
        $"COLLEGE ID          : [{staffUser.CollegeId}]"
    );

    Console.WriteLine(
        $"ASSIGNED YEAR RAW   : [{staffUser.AssignedYear}]"
    );

    if (!staffUser.CollegeId.HasValue)
    {
        return StatusCode(
            403,
            "Class Incharge has no CollegeId assigned."
        );
    }

    if (string.IsNullOrWhiteSpace(staffUser.AssignedYear))
    {
        return StatusCode(
            403,
            "Class Incharge has no AssignedYear."
        );
    }

    // Get college name from College table
    var collegeName =
        await _context.Colleges
            .Where(c =>
                c.Id == staffUser.CollegeId.Value
            )
            .Select(c => c.Name)
            .FirstOrDefaultAsync();

    if (string.IsNullOrWhiteSpace(collegeName))
    {
        return StatusCode(
            403,
            $"College not found for CollegeId {staffUser.CollegeId}."
        );
    }

    var normalizedCollege =
        collegeName.Trim().ToLower();

    var rawYear =
        staffUser.AssignedYear.Trim().ToLower();

    // Normalize staff year
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
        $"RESOLVED COLLEGE    : [{collegeName}]"
    );

    Console.WriteLine(
        $"NORMALIZED COLLEGE  : [{normalizedCollege}]"
    );

    Console.WriteLine(
        $"NORMALIZED YEAR     : [{normalizedYear}]"
    );

    // =====================================================
    // CLASS INCHARGE = COLLEGE + ASSIGNED YEAR
    // =====================================================

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

    Console.WriteLine(
        "CLASS INCHARGE FILTER APPLIED:"
    );

    Console.WriteLine(
        $"College = [{collegeName}]"
    );

    Console.WriteLine(
        $"Year    = [{normalizedYear}]"
    );
}
        // =====================================================
        // 12. HOSTEL INCHARGE
        // COLLEGE ONLY
        // =====================================================

        else if (isHostelIncharge)
        {
            if (string.IsNullOrWhiteSpace(staffCollege))
            {
                return StatusCode(
                    403,
                    "Hostel Incharge has no assigned college."
                );
            }


            var normalizedCollege =
                staffCollege.Trim().ToLower();


            Console.WriteLine(
                "HISTORY ACCESS: HOSTEL INCHARGE"
            );

            Console.WriteLine(
                $"FILTER COLLEGE : [{staffCollege}]"
            );


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
        }


        // =====================================================
        // 13. PRINCIPAL
        // COLLEGE ONLY
        // =====================================================

        else if (isPrincipal)
        {
            if (string.IsNullOrWhiteSpace(staffCollege))
            {
                return StatusCode(
                    403,
                    "Principal has no assigned college."
                );
            }


            var normalizedCollege =
                staffCollege.Trim().ToLower();


            Console.WriteLine(
                "HISTORY ACCESS: PRINCIPAL"
            );

            Console.WriteLine(
                $"FILTER COLLEGE : [{staffCollege}]"
            );


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
        }


        // =====================================================
        // 14. UNKNOWN ROLE
        // =====================================================

        else
        {
            Console.WriteLine(
                $"HISTORY DENIED: UNKNOWN ROLE [{role}]"
            );

            return StatusCode(
                403,
                $"Role '{role}' is not allowed to view outpass history."
            );
        }


        // =====================================================
        // 15. HISTORY STATUS
        // =====================================================
var history = await query
    .Where(x =>
        // Normal completed/final history
        x.Status == "Approved" ||
        x.Status == "Completed" ||
        x.Status == "Rejected" ||
        x.Status == "Cancelled" ||

        // Expired / not accepted
        x.Status == "Not Accepted By Class Incharge" ||
        x.Status == "Not Accepted By Warden" ||

        // Approval workflow history
        x.ApprovalStage == "FirstApproved" ||
        x.ApprovalStage == "SecondApproved" ||
        x.ApprovalStage == "FinalApproved" ||

        // Expired state
        x.OutpassState == "Expired"
    )
    .OrderByDescending(x => x.Id)
    .ToListAsync();


        // =====================================================
        // 16. DEBUG COUNT
        // =====================================================

        Console.WriteLine(
            $"OUTPASS HISTORY COUNT: {history.Count}"
        );


        foreach (var item in history.Take(10))
        {
            Console.WriteLine(
                $"HISTORY -> ID:{item.Id} " +
                $"Student:{item.StudentId} " +
                $"Status:{item.Status} " +
                $"Stage:{item.ApprovalStage}"
            );
        }

Console.WriteLine(
    "========== FINAL OUTPASS HISTORY =========="
);

Console.WriteLine(
    $"ROLE          : [{role}]"
);

Console.WriteLine(
    $"COLLEGE       : [{staffCollege}]"
);

Console.WriteLine(
    $"ASSIGNED YEAR : [{assignedYear}]"
);

Console.WriteLine(
    $"HISTORY COUNT : {history.Count}"
);

foreach (var item in history.Take(20))
{
    Console.WriteLine(
        $"HISTORY -> " +
        $"ID={item.Id}, " +
        $"Student={item.StudentId}, " +
        $"StudentName={item.StudentName}, " +
        $"Status={item.Status}, " +
        $"Stage={item.ApprovalStage}, " +
        $"Gender={item.Gender}"
    );
}
        return Ok(history);
    }
    catch (Exception ex)
    {
        Console.WriteLine(
            "========== OUTPASS HISTORY ERROR =========="
        );

        Console.WriteLine(ex.ToString());

        return StatusCode(
            500,
            "Failed to load outpass history."
        );
    }
}
}