using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Data;
using HostelTransportAPI.Models;
using HostelTransportAPI.DTOs;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HostelRoomAllocationController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public HostelRoomAllocationController(
        ApplicationDbContext context)
    {
        _context = context;
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
    string gender)
{
    var allocatedStudentIds =
        await _context.HostelRoomAllocations
        .Where(x => x.Status == "Allocated")
        .Select(x => x.StudentId)
        .ToListAsync();

    var students = await _context.StudentRegistrations
        .Where(x =>
            x.RegistrationType == "hostel" &&
            x.Status == "Approved" &&
            x.Gender.ToLower() == gender.ToLower() &&
            !allocatedStudentIds.Contains(x.StudentId))
        .Select(x => new
        {
            x.StudentId,
            x.StudentName,
            x.Department,
            x.Year,
            x.Gender
        })
        .ToListAsync();

    return Ok(students);
}
}