using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Data;
using HostelTransportAPI.DTOs;
using HostelTransportAPI.Models;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransportCancellationController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TransportCancellationController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTransportCancellationDto dto)
    {
       var student = await _context.TransportRegistrations
    .Include(x => x.Route)
    .Include(x => x.Stop)
    .FirstOrDefaultAsync(x =>
        x.StudentId == dto.StudentId &&
        x.IsApproved);
        if (student == null)
            return BadRequest("Student not found.");

        var exists = await _context.TransportCancellations
            .AnyAsync(x =>
                x.StudentId == dto.StudentId &&
                x.Status == "Pending");

        if (exists)
            return BadRequest("Cancellation request already submitted.");

        var request = new TransportCancellation
{
    StudentId = student.StudentId!,
    StudentName = student.StudentName,

    CollegeName = student.CollegeName,
    Department = student.Department,
    Year = student.Year,
    Batch = student.Batch,
    Phone = student.Phone,

    BusRoute = student.Route?.RouteName ?? "",
    BusNumber = student.Route?.BusNumber ?? "",
    PickupPoint = student.Stop?.StopName ?? "",

    Reason = dto.Reason,
    Status = "Pending",
    RequestedAt = DateTime.Now
};

        _context.TransportCancellations.Add(request);

        await _context.SaveChangesAsync();

        return Ok(request);
    }

    [HttpGet("{studentId}")]
    public async Task<IActionResult> GetStudentRequest(string studentId)
    {
        var request = await _context.TransportCancellations
            .Where(x => x.StudentId == studentId)
            .OrderByDescending(x => x.RequestedAt)
            .FirstOrDefaultAsync();

        if (request == null)
            return NotFound();

        return Ok(request);
    }

[HttpGet]
public async Task<IActionResult> GetAll()
{
    var expired = await _context.TransportCancellations
        .Where(x =>
            x.Status != "Pending" &&
            x.RequestedAt < DateTime.Now.AddHours(-24))
        .ToListAsync();

    if (expired.Any())
    {
        _context.TransportCancellations.RemoveRange(expired);
        await _context.SaveChangesAsync();
    }

    var data = await _context.TransportCancellations
        .OrderByDescending(x => x.RequestedAt)
        .ToListAsync();

    return Ok(data);
}
[HttpPost("approve/{id}")]
public async Task<IActionResult> Approve(int id)
{
    var request = await _context.TransportCancellations
        .FirstOrDefaultAsync(x => x.Id == id);

    if (request == null)
        return NotFound();

    request.Status = "Approved";

    // Delete transport registration
    var registration = await _context.TransportRegistrations
        .FirstOrDefaultAsync(x => x.StudentId == request.StudentId);

    if (registration != null)
        _context.TransportRegistrations.Remove(registration);

    // Delete login account
    var user = await _context.Users
        .FirstOrDefaultAsync(x => x.UserId == request.StudentId);

    if (user != null)
        _context.Users.Remove(user);

    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Transport cancelled successfully."
    });
}
[HttpPost("reject/{id}")]
public async Task<IActionResult> Reject(int id)
{
    var request = await _context.TransportCancellations
        .FirstOrDefaultAsync(x => x.Id == id);

    if (request == null)
        return NotFound();

    request.Status = "Rejected";

    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Cancellation rejected."
    });
}
}