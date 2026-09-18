using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Data;
using HostelTransportAPI.Models;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using HostelTransportAPI.Hubs;
namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VacatingController : ControllerBase
{
  private readonly ApplicationDbContext _context;
private readonly IHubContext<NotificationHub> _hub;

  public VacatingController(
    ApplicationDbContext context,
    IHubContext<NotificationHub> hub)
{
    _context = context;
    _hub = hub;
}
private async Task<string?> GetAllowedCollegeAsync()
{
    var role =
        User.FindFirst(ClaimTypes.Role)?.Value
        ?? User.FindFirst("role")?.Value;

var userId =
    User.FindFirst(ClaimTypes.NameIdentifier)?.Value
    ?? User.FindFirst("sub")?.Value
    ?? User.FindFirst("userId")?.Value
    ?? User.FindFirst("UserId")?.Value;

    if (string.IsNullOrWhiteSpace(role) ||
        string.IsNullOrWhiteSpace(userId))
    {
        return "__NO_ACCESS__";
    }

    role = role.Trim();

    // Management = ALL COLLEGES
 if (role.Equals("Management", StringComparison.OrdinalIgnoreCase) ||
    role.Equals("admin", StringComparison.OrdinalIgnoreCase))
{
    return null;
}
      var staffUser = await _context.Users
        .FirstOrDefaultAsync(u =>
            u.Id.ToString() == userId);

    if (staffUser == null)
        return "__NO_ACCESS__";
    // Class Incharge / Hostel Incharge / Admin Office / Principal
    if (
        role.Equals("Admin Office", StringComparison.OrdinalIgnoreCase) ||
        role.Equals("Class Incharge", StringComparison.OrdinalIgnoreCase) ||
        role.Equals("Hostel Incharge", StringComparison.OrdinalIgnoreCase) ||
        role.Equals("Principal", StringComparison.OrdinalIgnoreCase)
    )
    {
        if (staffUser.CollegeId == null ||
            staffUser.CollegeId == 0)
        {
            return "__NO_ACCESS__";
        }

        var college = await _context.Colleges
            .Where(c => c.Id == staffUser.CollegeId)
            .Select(c => c.Name)
            .FirstOrDefaultAsync();

        return college ?? "__NO_ACCESS__";
    }

    return "__NO_ACCESS__";
}
private async Task<string?> GetAllowedYearAsync()
{
    var role = User.FindFirst(ClaimTypes.Role)?.Value;
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrWhiteSpace(role) ||
        !role.Equals("Class Incharge", StringComparison.OrdinalIgnoreCase))
    {
        return null;
    }

    var staffUser = await _context.Users
        .FirstOrDefaultAsync(x => x.Id.ToString() == userId);

    return staffUser?.AssignedYear;
}
  [HttpGet]
public async Task<IActionResult> GetAll()
{
    var allowedCollege = await GetAllowedCollegeAsync();

    if (allowedCollege == "__NO_ACCESS__")
    {
        return Forbid();
    }

    try
    {
        var query = _context.VacatingRequests
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(allowedCollege))
        {
            query = query.Where(x =>
                _context.StudentRegistrations.Any(s =>
                    s.StudentId == x.StudentId &&
                    s.CollegeName == allowedCollege
                )
            );
        }

        var data = await query
            .Where(x =>
                x.Status == "Pending" ||

                (x.Status == "Approved" &&
                 x.ApprovedDate != null &&
                 x.ApprovedDate >= DateTime.Now.AddHours(-72))

                ||

                (x.Status == "Rejected" &&
                 x.RejectedDate != null &&
                 x.RejectedDate >= DateTime.Now.AddHours(-72))
            )
            .OrderByDescending(x => x.Id)
            .ToListAsync();

        return Ok(data);
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.ToString());
    }
}
   [HttpPost]
public async Task<IActionResult> Create(
    VacatingRequest request)
{
    var existingRequest =
        await _context.VacatingRequests
        .FirstOrDefaultAsync(x =>
            x.StudentId == request.StudentId &&
            x.Status == "Pending");

    if (existingRequest != null)
    {
        return BadRequest(
            "You already have a pending vacating request.");
    }
  var student = await _context.StudentRegistrations
    .FirstOrDefaultAsync(x =>
        x.StudentId == request.StudentId);
if (student != null)
if (student != null)
{
    request.StudentName = student.StudentName;
    request.Gender = student.Gender;
    request.Department = student.Department;
    request.Year = student.Year;
    request.Batch = student.Batch;
    request.Phone = student.Phone;
}

var allocation = await _context.HostelRoomAllocations
    .FirstOrDefaultAsync(x =>
        x.StudentId == request.StudentId &&
        x.Status == "Allocated");

if (allocation != null)
{
    request.RoomNumber = allocation.RoomNumber;
}
    request.RequestDate = DateTime.Now;
    request.Status = "Pending";


    _context.VacatingRequests.Add(request);

await _context.SaveChangesAsync();

await _hub.Clients.All.SendAsync(
    "VacatingCreated"
);

return Ok(request);

}
[HttpPut("approve/{id}")]
public async Task<IActionResult> Approve(int id)
{var allowedCollege = await GetAllowedCollegeAsync();

if (allowedCollege == "__NO_ACCESS__")
{
    return Forbid();
}
    var request = await _context.VacatingRequests.FindAsync(id);

    if (request == null)
        return NotFound("Vacating request not found");

    request.Status = "Approved";
    request.ApprovedDate = DateTime.Now;

  var registration = await _context.StudentRegistrations
    .FirstOrDefaultAsync(x => x.StudentId == request.StudentId);

if (registration == null)
{
    return BadRequest($"StudentRegistration NOT FOUND : {request.StudentId}");
}

if (!string.IsNullOrWhiteSpace(allowedCollege) &&
    !registration.CollegeName.Equals(
        allowedCollege,
        StringComparison.OrdinalIgnoreCase))
{
    return Forbid();
}

registration.Status = "Vacated";

// Disable student login
var user = await _context.Users
    .FirstOrDefaultAsync(x => x.UserId == request.StudentId);

if (user != null)
{
    user.IsActive = false;
}
var parentUser = await _context.Users
    .FirstOrDefaultAsync(x =>
        x.StudentId == request.StudentId);

if (parentUser != null)
{
    parentUser.IsActive = false;
}
    // Remove room allocation
    var allocation = await _context.HostelRoomAllocations
        .FirstOrDefaultAsync(x =>
            x.StudentId == request.StudentId &&
            x.Status == "Allocated");

    if (allocation != null)
    {
        _context.HostelRoomAllocations.Remove(allocation);
    }

 await _context.SaveChangesAsync();

await _hub.Clients.All.SendAsync(
    "VacatingUpdated",
    request.StudentId
);

await _hub.Clients.All.SendAsync(
    "ForceLogout",
    request.StudentId
);

// Read the row again from the database
var check = await _context.StudentRegistrations
    .AsNoTracking()
    .FirstOrDefaultAsync(x => x.StudentId == request.StudentId);

    return Ok(new
    
{
    StudentId = request.StudentId,
    NewStatus = registration.Status,
    DatabaseStatus = check?.Status
});
}
    [HttpPut("reject/{id}")]
    public async Task<IActionResult> Reject(int id)
    {

        var allowedCollege = await GetAllowedCollegeAsync();

if (allowedCollege == "__NO_ACCESS__")
{
    return Forbid();
}

var request =
    await _context.VacatingRequests.FindAsync(id);

if (request == null)
    return NotFound();

var registration =
    await _context.StudentRegistrations
        .FirstOrDefaultAsync(x =>
            x.StudentId == request.StudentId);

if (registration == null)
{
    return BadRequest(
        $"StudentRegistration NOT FOUND : {request.StudentId}");
}

if (!string.IsNullOrWhiteSpace(allowedCollege) &&
    !registration.CollegeName.Equals(
        allowedCollege,
        StringComparison.OrdinalIgnoreCase))
{
    return Forbid();
}
      

       request.Status = "Rejected";

request.RejectedDate = DateTime.Now;

request.StudentReadRejected = false;

       await _context.SaveChangesAsync();

await _hub.Clients.All.SendAsync(
    "VacatingUpdated",
    request.StudentId
);

return Ok(request);
    }

    [HttpGet("student/{studentId}")]
public async Task<IActionResult> GetStudentRequest(
    string studentId)
{
    var request = await _context.VacatingRequests
        .Where(x => x.StudentId == studentId)
        .OrderByDescending(x => x.Id)
        .FirstOrDefaultAsync();

    return Ok(request);
}[HttpGet("history")]
public async Task<IActionResult> GetHistory()
{
    var allowedCollege = await GetAllowedCollegeAsync();

    if (allowedCollege == "__NO_ACCESS__")
    {
        return Forbid();
    }

    try
    {
        var query = _context.VacatingRequests
            .Where(x => x.Status != "Pending");

        if (!string.IsNullOrWhiteSpace(allowedCollege))
        {
            query = query.Where(x =>
                _context.StudentRegistrations.Any(s =>
                    s.StudentId == x.StudentId &&
                    s.CollegeName == allowedCollege
                )
            );
        }

        var history = await query
            .OrderByDescending(x => x.Id)
            .ToListAsync();

        return Ok(history);
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.ToString());
    }
}
[HttpPut("acknowledge/{id}")]
public async Task<IActionResult> Acknowledge(int id)
{
    var request = await _context.VacatingRequests.FindAsync(id);

    if (request == null)
        return NotFound();

   request.StudentReadRejected = true;

  await _context.SaveChangesAsync();

await _hub.Clients.All.SendAsync(
    "VacatingUpdated",
    request.StudentId
);

return Ok();
}
}