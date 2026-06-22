using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;
using HostelTransportAPI.Models;
using HostelTransportAPI.DTOs;
namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OutpassesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public OutpassesController(ApplicationDbContext context)
    {
        _context = context;
    }

   [HttpGet]
public IActionResult GetAll()
{
    try
    {
        var data = _context.Outpasses.ToList();

        Console.WriteLine($"OUTPASSES COUNT: {data.Count}");

        return Ok(data);
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
    var student = _context.StudentRegistrations
        .FirstOrDefault(x => x.StudentId == outpass.StudentId);

    if (student != null)
    {
        outpass.StudentName = student.StudentName;
        outpass.Gender = student.Gender;
    }

    _context.Outpasses.Add(outpass);

    await _context.SaveChangesAsync();

    return Ok(outpass);
}

[HttpPut("approve/{id}")]
public async Task<IActionResult> Approve(int id)
{
    var outpass = await _context.Outpasses.FindAsync(id);

    if (outpass == null)
        return NotFound();

   outpass.Status = "Approved";

outpass.OutpassState = "Active";

    await _context.SaveChangesAsync();

    return Ok(outpass);
}


[HttpPut("reject/{id}")]
public async Task<IActionResult> Reject(int id)
{
    var outpass = await _context.Outpasses.FindAsync(id);

    if (outpass == null)
        return NotFound();

    outpass.Status = "Rejected";

    await _context.SaveChangesAsync();

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

    outpass.OutpassState = "Outside Hostel";

    outpass.ActualExitTime = DateTime.Now;

    outpass.ExitLatitude = dto.Latitude;

    outpass.ExitLongitude = dto.Longitude;

    await _context.SaveChangesAsync();

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

    outpass.ActualReturnTime = DateTime.Now;

    outpass.ReturnLatitude = dto.Latitude;

    outpass.ReturnLongitude = dto.Longitude;

    if (outpass.ActualReturnTime > outpass.ValidTo)
    {
        outpass.LateMinutes =
            (int)(outpass.ActualReturnTime.Value - outpass.ValidTo)
            .TotalMinutes;
    }

    await _context.SaveChangesAsync();

    return Ok(outpass);
}
}