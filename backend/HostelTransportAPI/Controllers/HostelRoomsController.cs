using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Data;
using HostelTransportAPI.Models;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HostelRoomsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public HostelRoomsController(
        ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var rooms = await _context.HostelRooms
            .OrderBy(x => x.RoomNumber)
            .ToListAsync();

        return Ok(rooms);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        HostelRoom room)
    {
        _context.HostelRooms.Add(room);

        await _context.SaveChangesAsync();

        return Ok(room);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        HostelRoom room)
    {
        var existing =
            await _context.HostelRooms.FindAsync(id);

        if (existing == null)
            return NotFound();

        existing.Gender = room.Gender;
        existing.Block = room.Block;
        existing.RoomNumber = room.RoomNumber;
        existing.Capacity = room.Capacity;
        existing.Status = room.Status;

        await _context.SaveChangesAsync();

        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(
        int id)
    {
        var room =
            await _context.HostelRooms.FindAsync(id);

        if (room == null)
            return NotFound();

        _context.HostelRooms.Remove(room);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Message = "Room deleted successfully"
        });
    }
}