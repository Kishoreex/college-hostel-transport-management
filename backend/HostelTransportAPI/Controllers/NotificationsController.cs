using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;
using HostelTransportAPI.Models;
namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public NotificationsController(
        ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("{userId}")]
    public IActionResult GetNotifications(
        int userId)
    {
        var notifications =
            _context.Notifications
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToList();

        return Ok(notifications);
    }


[HttpPost]
public async Task<IActionResult> CreateNotification(
    Notification notification)
{
    _context.Notifications.Add(notification);

    await _context.SaveChangesAsync();

    return Ok(notification);
}

[HttpGet("count/{userId}")]
public IActionResult GetUnreadCount(
    int userId)
{
    var count =
        _context.Notifications
        .Count(x =>
            x.UserId == userId &&
            x.IsRead == false);

    return Ok(count);
}
[HttpGet("user/{userId}")]
public IActionResult GetUserNotifications(
    int userId)
{
    var notifications =
        _context.Notifications
        .Where(x => x.UserId == userId)
        .OrderByDescending(x => x.CreatedAt)
        .ToList();

    return Ok(notifications);
}
[HttpPut("read/{id}")]
public async Task<IActionResult> MarkRead(int id)
{
    var notification =
        await _context.Notifications
        .FindAsync(id);

    if (notification == null)
        return NotFound();

    notification.IsRead = true;

    await _context.SaveChangesAsync();

    return Ok();
}
}