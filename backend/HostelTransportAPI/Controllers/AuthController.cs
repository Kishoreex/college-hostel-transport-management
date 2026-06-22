using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Data;
using HostelTransportAPI.DTOs;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuthController(ApplicationDbContext context)
    {
        _context = context;
    }
[HttpPost("login")]
public async Task<IActionResult> Login(LoginRequestDto request)
{
    try
    {
        var user = await _context.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x =>
                (x.Email == request.UserId ||
                 x.UserId == request.UserId) &&
                 x.IsActive);

        if (user == null)
            return Unauthorized("Invalid Email");

        bool validPassword =
            BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash);

        if (!validPassword)
            return Unauthorized("Invalid Password");

        return Ok(new
        {
            user.Id,
            user.UserId,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            Role = user.Role?.Name,

            user.IsSystemAdmin,
            user.CanManageTransport,
            user.CanManageBoysHostel,
            user.CanManageGirlsHostel
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.ToString());
    }
}
}