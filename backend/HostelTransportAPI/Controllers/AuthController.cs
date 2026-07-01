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
Console.WriteLine("========== LOGIN ==========");
Console.WriteLine($"UserId    : {request.UserId}");
Console.WriteLine($"Module    : {request.Module}");
Console.WriteLine($"DeviceId  : {request.DeviceId}");
Console.WriteLine(user == null
    ? "User NOT FOUND"
    : $"User FOUND : {user.UserId}");

        if (user == null)
            return Unauthorized("Invalid Email");
            bool validPassword =
    BCrypt.Net.BCrypt.Verify(
        request.Password,
        user.PasswordHash);

Console.WriteLine($"Password Valid : {validPassword}");

if (!validPassword)
    return Unauthorized("Invalid Credentials");

// ================= MODULE VALIDATION =================

if (user.RoleId == 2) // Student
{
    if (!string.Equals(
            user.Module,
            request.Module,
            StringComparison.OrdinalIgnoreCase))
    {
        return BadRequest(
            $"You can login only to the {user.Module} portal.");
    }
}

if (user.RoleId == 1) // Admin
{
    if (!string.Equals(
            request.Module,
            "Admin",
            StringComparison.OrdinalIgnoreCase))
    {
        return BadRequest(
            "Admins can login only through Admin Portal.");
    }
}

// =====================================================

Console.WriteLine($"Database DeviceId : {user.DeviceId}");
Console.WriteLine($"Request DeviceId  : {request.DeviceId}");

// Check if student has an active outpass
bool hasActiveOutpass = false;

if (user.RoleId == 2) // Student
{
    hasActiveOutpass = _context.Outpasses.Any(x =>
        x.StudentId == user.UserId &&
        (
            x.OutpassState == "Active" ||
            x.OutpassState == "Outside Hostel"
        ));
}

// First login
if (string.IsNullOrWhiteSpace(user.DeviceId))
{
    user.DeviceId = request.DeviceId;

    Console.WriteLine("First login - saving device.");
}
// Same device
else if (user.DeviceId == request.DeviceId)
{
    Console.WriteLine("Same device login allowed.");
}
// Different device
else
{
    if (hasActiveOutpass)
    {
        return BadRequest(
            "You have an active outpass. Login from another device is not allowed."
        );
    }

    return BadRequest(
        "This account is already logged in on another device."
    );
}
user.LastLogin = DateTime.UtcNow;

await _context.SaveChangesAsync();
var student = await _context.StudentRegistrations
    .FirstOrDefaultAsync(x => x.StudentId == user.UserId);

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
    user.CanManageGirlsHostel,

    ProfilePhoto = student?.ProfilePhoto
});
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.ToString());
    }
}
[HttpPost("logout/{userId}")]
public async Task<IActionResult> Logout(string userId)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(x => x.UserId == userId);

    if (user == null)
        return NotFound();

    user.DeviceId = null;

    await _context.SaveChangesAsync();

    return Ok();
}
[HttpPost("change-password")]
public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(x => x.UserId == request.UserId);

    if (user == null)
        return NotFound("User not found");

    bool valid = BCrypt.Net.BCrypt.Verify(
        request.CurrentPassword,
        user.PasswordHash);

    if (!valid)
        return BadRequest("Current password is incorrect");

    user.PasswordHash =
        BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

    await _context.SaveChangesAsync();

    return Ok("Password updated successfully");
}
}