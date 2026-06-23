using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Data;
using HostelTransportAPI.Models;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VacatingController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public VacatingController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _context.VacatingRequests.ToListAsync());
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
{
    request.StudentName = student.StudentName;
    request.Gender = student.Gender;
    request.Department = student.Department;
    request.Year = student.Year;
    request.Batch = student.Batch;
   
    request.Phone = student.Phone;
}
    request.RequestDate = DateTime.Now;
    request.Status = "Pending";


    _context.VacatingRequests.Add(request);

    await _context.SaveChangesAsync();

    return Ok(request);
}

    [HttpPut("approve/{id}")]
    public async Task<IActionResult> Approve(int id)
    {
        var request =
            await _context.VacatingRequests.FindAsync(id);

        if (request == null)
            return NotFound();

        request.Status = "Approved";

        await _context.SaveChangesAsync();

        return Ok(request);
    }

    [HttpPut("reject/{id}")]
    public async Task<IActionResult> Reject(int id)
    {
        var request =
            await _context.VacatingRequests.FindAsync(id);

        if (request == null)
            return NotFound();

        request.Status = "Rejected";

        await _context.SaveChangesAsync();

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
}
}