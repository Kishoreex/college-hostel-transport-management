using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminDashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminDashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

  [HttpGet("summary")]
public IActionResult Summary()
{
    var hostelStudents = _context.Users
        .Count(x =>
            x.RoleId == 2 &&          // Student
            x.Module == "Hostel" &&
            x.IsActive);

    var transportStudents = _context.TransportRegistrations
        .Count(x => x.Status == "Approved");

    var totalStudents = hostelStudents + transportStudents;

    return Ok(new
    {
        totalStudents,
        hostelStudents,
        transportStudents
    });
}
}