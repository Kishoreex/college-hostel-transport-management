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

await _hub.Clients.All.SendAsync(
    "RoomCreated"
);

return Ok(room);
    }

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
    var allocations = await _context.HostelRoomAllocations
    .Where(x => x.RoomNumber == roomNumber)
    .ToListAsync();

foreach (var allocation in allocations)
{
    allocation.RoomNumber = room.RoomNumber;
}
    existing.Capacity = room.Capacity;

    await _context.SaveChangesAsync();

    await _hub.Clients.All.SendAsync(
        "RoomUpdated"
    );

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

await _hub.Clients.All.SendAsync(
    "RoomUpdated"
);

return Ok(new
{
    Message = "Room deleted successfully"
});
    }
    
}