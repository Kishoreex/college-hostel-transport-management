using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActivityLogsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ActivityLogsController(
        ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetLogs()
    {
        var logs = _context.ActivityLogs
            .OrderByDescending(x => x.CreatedAt)
            .Take(100)
            .ToList();

        return Ok(logs);
    }
}