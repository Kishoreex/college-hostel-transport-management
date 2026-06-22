using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;
using HostelTransportAPI.Models;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationSettingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public NotificationSettingsController(
        ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("{userId}")]
    public IActionResult Get(int userId)
    {
        var setting =
            _context.NotificationSettings
            .FirstOrDefault(x =>
                x.UserId == userId);

        return Ok(setting);
    }

    [HttpPost]
    public async Task<IActionResult> Save(
        NotificationSetting setting)
    {
        var existing =
            _context.NotificationSettings
            .FirstOrDefault(x =>
                x.UserId == setting.UserId);

        if(existing == null)
        {
            _context.NotificationSettings
                .Add(setting);
        }
        else
        {
            existing.PushNotifications =
                setting.PushNotifications;

            existing.NewOutpassRequest =
                setting.NewOutpassRequest;

            existing.NewLeaveApplication =
                setting.NewLeaveApplication;

            existing.NewUserRegistration =
                setting.NewUserRegistration;
        }

        await _context.SaveChangesAsync();

        return Ok();
    }
}