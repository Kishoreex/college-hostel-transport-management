using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Data;
using HostelTransportAPI.Models;
using Microsoft.AspNetCore.SignalR;
using HostelTransportAPI.Hubs;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HostelRoomsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<NotificationHub> _hub;

    public HostelRoomsController(
        ApplicationDbContext context,
        IHubContext<NotificationHub> hub)
    {
        _context = context;
        _hub = hub;
    }

    // GET: api/HostelRooms
    // Management -> all rooms
    // Other staff -> only their college rooms
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? college)
    {
        var query = _context.HostelRooms.AsQueryable();

        // Management sends no college -> all rooms
        if (!string.IsNullOrWhiteSpace(college))
        {
            query = query.Where(x =>
                x.CollegeName == college);
        }

        var rooms = await query
            .OrderBy(x => x.RoomNumber)
            .ToListAsync();

        return Ok(rooms);
    }


    // POST: api/HostelRooms
    [HttpPost]
    public async Task<IActionResult> Create(
        HostelRoom room)
    {
        if (string.IsNullOrWhiteSpace(room.CollegeName))
        {
            return BadRequest("CollegeName is required");
        }

        // Prevent duplicate room number inside same college
        var exists = await _context.HostelRooms
            .AnyAsync(x =>
                x.RoomNumber == room.RoomNumber &&
                x.CollegeName == room.CollegeName);

        if (exists)
        {
            return BadRequest(
                "This room already exists for this college");
        }

        _context.HostelRooms.Add(room);

        await _context.SaveChangesAsync();

        await _hub.Clients.All.SendAsync(
            "RoomCreated"
        );

        return Ok(room);
    }


    // PUT: api/HostelRooms/{roomNumber}
    [HttpPut("{roomNumber}")]
    public async Task<IActionResult> Update(
        string roomNumber,
        HostelRoom room)
    {
        var existing = await _context.HostelRooms
            .FirstOrDefaultAsync(x =>
                x.RoomNumber == roomNumber);

        if (existing == null)
            return NotFound();

        existing.RoomNumber = room.RoomNumber;
        existing.Capacity = room.Capacity;

        // College should not normally change during edit.
        // Keep existing CollegeName.
        
        var allocations = await _context.HostelRoomAllocations
            .Where(x => x.RoomNumber == roomNumber)
            .ToListAsync();

        foreach (var allocation in allocations)
        {
            allocation.RoomNumber = room.RoomNumber;
        }

        await _context.SaveChangesAsync();

        await _hub.Clients.All.SendAsync(
            "RoomUpdated"
        );

        return Ok(existing);
    }


    // DELETE: api/HostelRooms/{id}
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

        await _hub.Clients.All.SendAsync(
            "RoomUpdated"
        );

        return Ok(new
        {
            Message = "Room deleted successfully"
        });
    }
}