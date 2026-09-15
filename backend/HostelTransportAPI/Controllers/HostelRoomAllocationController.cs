using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Data;
using HostelTransportAPI.Models;
using HostelTransportAPI.DTOs;
using Microsoft.AspNetCore.SignalR;
using HostelTransportAPI.Hubs;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HostelRoomAllocationController : ControllerBase
{
   private readonly ApplicationDbContext _context;
private readonly IHubContext<NotificationHub> _hub;

public HostelRoomAllocationController(
    ApplicationDbContext context,
    IHubContext<NotificationHub> hub)
{
    _context = context;
    _hub = hub;
}
private async Task<(string? College, string? AssignedYear)> GetStaffScopeAsync()
{
    var role =
        User.FindFirst(ClaimTypes.Role)?.Value
        ?? User.FindFirst("role")?.Value;

    var userId =
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst("userId")?.Value
        ?? User.FindFirst("UserId")?.Value;

    if (string.IsNullOrWhiteSpace(role) ||
        string.IsNullOrWhiteSpace(userId))
    {
        return (null, null);
    }

    var staffUser = await _context.Users
        .FirstOrDefaultAsync(x =>
            x.UserId == userId);

    if (staffUser == null)
        return (null, null);

    string? college = null;

    if (staffUser.CollegeId.HasValue &&
        staffUser.CollegeId.Value != 0)
    {
        college = await _context.Colleges
            .Where(x => x.Id == staffUser.CollegeId.Value)
            .Select(x => x.Name)
            .FirstOrDefaultAsync();
    }

    string? assignedYear = null;

    if (role.Equals(
        "Class Incharge",
        StringComparison.OrdinalIgnoreCase))
    {
        assignedYear = staffUser.AssignedYear;
    }

    return (college, assignedYear);
}
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var allocations = await _context.HostelRoomAllocations
            .OrderByDescending(x => x.Id)
            .ToListAsync();

        return Ok(allocations);
    }

    [HttpGet("student/{studentId}")]
    public async Task<IActionResult> GetByStudent(
        string studentId)
    {
        var allocation = await _context.HostelRoomAllocations
            .FirstOrDefaultAsync(x =>
                x.StudentId == studentId &&
                x.Status == "Allocated");

        if (allocation == null)
            return NotFound();

        return Ok(allocation);
    }

    [HttpPost]
    public async Task<IActionResult> AllocateRoom(
        CreateHostelRoomAllocationDto dto)
    {
        var student = await _context.StudentRegistrations
            .FirstOrDefaultAsync(x =>
                x.StudentId == dto.StudentId);

        if (student == null)
            return BadRequest("Student not found");

        var existingAllocation =
            await _context.HostelRoomAllocations
            .FirstOrDefaultAsync(x =>
                x.StudentId == dto.StudentId &&
                x.Status == "Allocated");

        if (existingAllocation != null)
        {
            return BadRequest(
                "Student already has a room allocation");
        }

        var allocation = new HostelRoomAllocation
        {
            StudentId = student.StudentId ?? "",
            StudentName = student.StudentName,
            Gender = student.Gender,
            Block = dto.Block,
            RoomNumber = dto.RoomNumber,
            BedNumber = dto.BedNumber,
            AllocatedDate = DateTime.Now,
            Status = "Allocated"
        };

        _context.HostelRoomAllocations.Add(allocation);

       await _context.SaveChangesAsync();

await _hub.Clients.All.SendAsync(
    "RoomAllocationUpdated"
);

return Ok(allocation);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveAllocation(
        int id)
    {
        var allocation =
            await _context.HostelRoomAllocations
            .FindAsync(id);
 
        if (allocation == null)
            return NotFound();

        _context.HostelRoomAllocations.Remove(allocation);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Message = "Allocation removed successfully"
        });
    }    

    
[HttpGet("available-students/{gender}")]
public async Task<IActionResult> GetAvailableStudents(
    string gender,
    [FromQuery] string? college)
{
    var scope = await GetStaffScopeAsync();

    var allowedCollege = scope.College;
    var assignedYear = scope.AssignedYear;

    var allocatedStudentIds =
        await _context.HostelRoomAllocations
            .Where(x => x.Status == "Allocated")
            .Select(x => x.StudentId)
            .ToListAsync();

    var query = _context.StudentRegistrations
        .Where(x =>
            x.RegistrationType.ToLower() == "hostel" &&
            x.Status.ToLower() == "active" &&
            x.Gender.ToLower() == gender.ToLower() &&
            x.StudentId != null &&
            !allocatedStudentIds.Contains(x.StudentId));

    // ---------------------------------------------------------
    // COLLEGE SECURITY
    // ---------------------------------------------------------

    if (!string.IsNullOrWhiteSpace(allowedCollege))
    {
        query = query.Where(x =>
            x.CollegeName == allowedCollege);
    }
    else if (!string.IsNullOrWhiteSpace(college))
    {
        // Management can filter by selected college
        query = query.Where(x =>
            x.CollegeName == college);
    }

    // ---------------------------------------------------------
    // CLASS INCHARGE YEAR SECURITY
    // ---------------------------------------------------------

    if (!string.IsNullOrWhiteSpace(assignedYear))
    {
        query = query.Where(x =>
            x.Year == assignedYear);
    }

    var students = await query
        .Select(x => new
        {
            x.StudentId,
            x.StudentName,
            x.RegisterNumber,
            x.CollegeName,
            x.Department,
            x.Year,
            x.Batch,
            x.Gender,
            x.Phone
        })
        .OrderBy(x => x.StudentName)
        .ToListAsync();

    return Ok(students);
}
[HttpDelete("student/{studentId}")]
public async Task<IActionResult> RemoveStudent(string studentId)
{
    var allocation = await _context.HostelRoomAllocations
        .FirstOrDefaultAsync(x =>
            x.StudentId == studentId &&
            x.Status == "Allocated");

    if (allocation == null)
        return NotFound();

    _context.HostelRoomAllocations.Remove(allocation);

    await _context.SaveChangesAsync();

    await _hub.Clients.All.SendAsync(
        "RoomAllocationUpdated"
    );

    return Ok();
}

public class ChangeRoomDto
{
    public string StudentId { get; set; } = "";
    public string RoomNumber { get; set; } = "";
}

[HttpPut("change-room")]
public async Task<IActionResult> ChangeRoom(ChangeRoomDto dto)
{
    var allocation = await _context.HostelRoomAllocations
        .FirstOrDefaultAsync(x =>
            x.StudentId == dto.StudentId &&
            x.Status == "Allocated");

    if (allocation == null)
        return NotFound();

    allocation.RoomNumber = dto.RoomNumber;

    await _context.SaveChangesAsync();

    await _hub.Clients.All.SendAsync(
        "RoomAllocationUpdated"
    );

    return Ok(allocation);
}
}