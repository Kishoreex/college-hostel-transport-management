    using Microsoft.AspNetCore.Mvc;
    using HostelTransportAPI.Data;
    using HostelTransportAPI.Models;
    using HostelTransportAPI.DTOs;
    namespace HostelTransportAPI.Controllers;

    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

    [HttpGet]
    public IActionResult GetUsers()
    {
        var users = _context.Users
            .Where(x => x.RoleId != 2)
            .ToList();

        return Ok(users);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(User user)
    {
        user.PasswordHash =
            BCrypt.Net.BCrypt.HashPassword(
                user.PasswordHash
            );

        _context.Users.Add(user);var systemAdmins = _context.Users
    .Where(x => x.IsSystemAdmin)
    .ToList();

foreach (var admin in systemAdmins)
{
    
   var setting =
    _context.NotificationSettings
    .FirstOrDefault(x =>
        x.UserId == admin.Id);

if (setting == null ||
    (setting.PushNotifications &&
     setting.NewUserRegistration))
{
    _context.Notifications.Add(
        new Notification
        {
            UserId = admin.Id,
            Title = "New User Created",
            Message = $"{user.FullName} account created",
            Type = "User",
            IsRead = false,
            CreatedAt = DateTime.Now
        }
    );
}
}
_context.ActivityLogs.Add(
    new ActivityLog
    {
        UserId = 6,
        UserName = "Main Administrator",
        Action = $"Created user {user.FullName}",
        Module = "Users",
        CreatedAt = DateTime.Now
    });
    _context.ActivityLogs.Add(
    new ActivityLog
    {
        UserId = user.Id,
        UserName = user.FullName,
        Action = "Changed Password",
        Module = "Users",
        CreatedAt = DateTime.Now
    });
        await _context.SaveChangesAsync();

        return Ok(user);
    }
   
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(
        int id,
        User updatedUser)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        user.FullName = updatedUser.FullName;
        user.Email = updatedUser.Email;
        user.PhoneNumber = updatedUser.PhoneNumber;

        user.IsSystemAdmin =
            updatedUser.IsSystemAdmin;

        user.CanManageTransport =
            updatedUser.CanManageTransport;

        user.CanManageBoysHostel =
            updatedUser.CanManageBoysHostel;

        user.CanManageGirlsHostel =
            updatedUser.CanManageGirlsHostel;

        if (!string.IsNullOrWhiteSpace(updatedUser.PasswordHash))
        {
            user.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    updatedUser.PasswordHash
                );
        }
_context.ActivityLogs.Add(
    new ActivityLog
    {
        UserId = 6,
        UserName = "Main Administrator",
        Action = $"Updated user {user.FullName}",
        Module = "Users",
        CreatedAt = DateTime.Now
    });
        await _context.SaveChangesAsync();

        return Ok(user);
    }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            _context.Users.Remove(user);

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        return Ok(user);
    }

    [HttpPost("change-password/{id}")]
    public async Task<IActionResult> ChangePassword(
        int id,
        ChangePasswordDto dto)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        bool validPassword =
            BCrypt.Net.BCrypt.Verify(
                dto.CurrentPassword,
                user.PasswordHash
            );
Console.WriteLine($"Password Valid : {validPassword}");
        if (!validPassword)
            return BadRequest("Current Password Incorrect");

        user.PasswordHash =
            BCrypt.Net.BCrypt.HashPassword(
                dto.NewPassword
            );

        await _context.SaveChangesAsync();

        return Ok("Password Updated");
    }

    [HttpPut("disable/{id}")]
    public async Task<IActionResult> DisableUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        user.IsActive = false;
        _context.ActivityLogs.Add(
    new ActivityLog
    {
        UserId = 6,
        UserName = "Main Administrator",
        Action = $"Disabled user {user.FullName}",
        Module = "Users",
        CreatedAt = DateTime.Now
    });
        await _context.SaveChangesAsync();

        return Ok();
    }
    [HttpPut("enable/{id}")]
    public async Task<IActionResult> EnableUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        user.IsActive = true;
_context.ActivityLogs.Add(
    new ActivityLog
    {
        UserId = 6,
        UserName = "Main Administrator",
        Action = $"Enabled user {user.FullName}",
        Module = "Users",
        CreatedAt = DateTime.Now
    });
        await _context.SaveChangesAsync();

        return Ok();
    }
    }