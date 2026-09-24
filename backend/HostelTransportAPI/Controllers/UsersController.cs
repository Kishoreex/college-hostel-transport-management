using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Data;
using HostelTransportAPI.Models;
using HostelTransportAPI.DTOs;
using System.Security.Claims;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Management")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private const string ProtectedManagementUserId = "MainAdmin@mdch";

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }


    // =====================================================
    // GET ALL USERS
    // SYSTEM ADMIN ONLY
    // =====================================================

// =====================================================
// GET ALL STAFF USERS
// Shows ONLY:
// System Admin
// Principal
// Hostel Incharge
// Admin Office
// Management
//
// Does NOT show:
// Student
// Parent
// =====================================================

[HttpGet]
public async Task<IActionResult> GetUsers()
{
    var users = await _context.Users
        .Include(x => x.Role)
        .Include(x => x.College)
    .Where(x =>
    x.RoleId == 3 ||      // Principal
    x.RoleId == 4 ||      // Hostel Incharge
    x.RoleId == 5 ||      // Admin Office
   x.RoleId == 1003 ||     // Class Incharge
    x.RoleId == 1002     // Management
)
        .Select(x => new
        {
            x.Id,
            x.UserId,
            x.FullName,
            x.Email,
            x.PhoneNumber,

            x.RoleId,
            Role = x.Role!.Name,

            x.CollegeId,

            College = x.College != null
                ? x.College.Name
                : "All Colleges",

            x.Module,

            x.CanManageTransport,
            x.CanManageBoysHostel,
            x.CanManageGirlsHostel,

          x.HostelApprovalLevel,
x.AssignedYear,

x.IsActive,
x.LastLogin,
x.ProfilePhoto
        })
        .ToListAsync();

    return Ok(users);
}
    // =====================================================
    // CREATE USER
    // SYSTEM ADMIN ONLY
    // =====================================================

    [HttpPost]
    public async Task<IActionResult> CreateUser(User user)
    {
        // -------------------------------------------------
        // Validate Role
        // -------------------------------------------------

        var role = await _context.Roles
            .FirstOrDefaultAsync(x => x.Id == user.RoleId);

        if (role == null)
        {
            return BadRequest("Invalid role selected.");
        }

// -------------------------------------------------
// Class Incharge - Assigned Year
// -------------------------------------------------

if (role.Name.Equals("Class Incharge", StringComparison.OrdinalIgnoreCase))
{
    if (string.IsNullOrWhiteSpace(user.AssignedYear))
    {
        return BadRequest("Assigned Year is required for Class Incharge.");
    }
}
else
{
    user.AssignedYear = null;
}
        // Students cannot be created from Settings → Users
      if (
    role.Name == "Student" ||
    role.Name == "Parent"
)
{
    return BadRequest(
        "Student and Parent users cannot be created from Settings → Users."
    );
}


// =====================================================
// COLLEGE
// =====================================================

bool isAllCollegeRole =
    role.Name.Equals(
        "System Admin",
        StringComparison.OrdinalIgnoreCase
    )
    ||
    role.Name.Equals(
        "Management",
        StringComparison.OrdinalIgnoreCase
    )
    ||
    (
        role.Name.Equals(
            "Admin Office",
            StringComparison.OrdinalIgnoreCase
        )
        &&
        !user.CollegeId.HasValue
    );

if (isAllCollegeRole)
{
    // NULL = ALL COLLEGES
    user.CollegeId = null;
}
else
{
    if (!user.CollegeId.HasValue)
    {
        return BadRequest(
            "College is required."
        );
    }

    var collegeExists =
        await _context.Colleges.AnyAsync(
            x =>
                x.Id == user.CollegeId.Value &&
                x.IsActive
        );

    if (!collegeExists)
    {
        return BadRequest(
            "Invalid or inactive college selected."
        );
    }
}

        // -------------------------------------------------
        // Check duplicate User ID
        // -------------------------------------------------

        var existingUserId = await _context.Users
            .AnyAsync(x => x.UserId == user.UserId);

        if (existingUserId)
        {
            return BadRequest(
                "User ID already exists."
            );
        }


        // -------------------------------------------------
        // Check duplicate Email
        // -------------------------------------------------

        var existingEmail = await _context.Users
            .AnyAsync(x => x.Email == user.Email);

        if (existingEmail)
        {
            return BadRequest(
                "Email already exists."
            );
        }


        // -------------------------------------------------
        // Password
        // -------------------------------------------------

        if (string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            return BadRequest(
                "Password is required."
            );
        }

        user.PasswordHash =
            BCrypt.Net.BCrypt.HashPassword(
                user.PasswordHash
            );


        // -------------------------------------------------
        // Force staff settings
        // -------------------------------------------------

        user.IsActive = true;
        

      // =====================================================
// PERMISSIONS
// =====================================================

user.IsSystemAdmin = false;

var modules = (user.Module ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries)
    .Select(x => x.Trim())
    .ToList();

if (role.Name == "Management")
{
    // Management has ALL permissions
    user.Module = "Hostel,Transport";

    user.CanManageTransport = true;
    user.CanManageBoysHostel = true;
    user.CanManageGirlsHostel = true;

    user.HostelApprovalLevel = "All";
}
else
{
    // Transport permission
    user.CanManageTransport =
        modules.Contains("Transport");

    // Hostel permissions
    if (modules.Contains("Hostel"))
    {
        user.CanManageBoysHostel =
            user.CanManageBoysHostel;

        user.CanManageGirlsHostel =
            user.CanManageGirlsHostel;

        if (string.IsNullOrWhiteSpace(
            user.HostelApprovalLevel))
        {
            return BadRequest(
                "Hostel approval level is required."
            );
        }
    }
    else
    {
        user.CanManageBoysHostel = false;
        user.CanManageGirlsHostel = false;
        user.HostelApprovalLevel = null;
    }

    // Transport only
    if (!modules.Contains("Transport"))
    {
        user.CanManageTransport = false;
    }
}


        _context.Users.Add(user);

        await _context.SaveChangesAsync();


        // -------------------------------------------------
        // Notify System Admins
        // -------------------------------------------------

     // =====================================================
// NOTIFY MANAGEMENT
// =====================================================

var managementUsers = await _context.Users
    .Where(x =>
        x.RoleId == 1002 &&
        x.IsActive)
    .ToListAsync();

foreach (var manager in managementUsers)
{
    var setting =
        await _context.NotificationSettings
            .FirstOrDefaultAsync(
                x => x.UserId == manager.Id
            );

    if (
        setting == null ||
        (
            setting.PushNotifications &&
            setting.NewUserRegistration
        )
    )
    {
        _context.Notifications.Add(
            new Notification
            {
                UserId = manager.Id,
                Title = "New User Created",
                Message =
                    $"{user.FullName} account created",
                Type = "User",
                IsRead = false,
                CreatedAt = DateTime.Now
            }
        );
    }
}


        // -------------------------------------------------
        // Activity Log
        // -------------------------------------------------

        var currentUserId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

        var currentUser =
            await _context.Users
                .FirstOrDefaultAsync(x =>
                    x.Id.ToString() == currentUserId
                );


        _context.ActivityLogs.Add(
            new ActivityLog
            {
                UserId = currentUser?.Id ?? 0,
                UserName =
                    currentUser?.FullName ??
                    "System Admin",
                Action =
                    $"Created user {user.FullName}",
                Module = "Users",
                CreatedAt = DateTime.Now
            }
        );


        await _context.SaveChangesAsync();

return Ok(new
{
    user.Id,
    user.UserId,
    user.FullName,
    user.Email,
    user.PhoneNumber,

    user.RoleId,
    Role = role.Name,

    user.CollegeId,

    College = user.CollegeId.HasValue
        ? (
            await _context.Colleges
                .Where(x =>
                    x.Id == user.CollegeId.Value)
                .Select(x => x.Name)
                .FirstOrDefaultAsync()
          )
        : "All Colleges",

    user.AssignedYear,

    user.IsActive
});
    }


    // =====================================================
    // UPDATE USER
    // SYSTEM ADMIN ONLY
    // =====================================================

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(
        int id,
        User updatedUser)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == id);

        if (user == null)
        {
            return NotFound();



        }
if (user.RoleId == 1002)
{
    return BadRequest(
        "Management accounts cannot be disabled."
    );
}
                // Protect Management master account
    if (
        string.Equals(
            user.UserId,
            ProtectedManagementUserId,
            StringComparison.OrdinalIgnoreCase
        )
    )
    {
        return BadRequest(
            "The Management account cannot be modified."
        );
    }
        // -------------------------------------------------
        // Validate Role
        // -------------------------------------------------

        var role = await _context.Roles
            .FirstOrDefaultAsync(
                x => x.Id == updatedUser.RoleId
            );

        if (role == null)
        {
            return BadRequest(
                "Invalid role selected."
            );
        }

        if (role.Name == "Student")
        {
            return BadRequest(
                "Student role cannot be assigned here."
            );
        }


// -------------------------------------------------
// Validate College
// -------------------------------------------------

bool isAllCollegeRole =
    role.Name.Equals(
        "System Admin",
        StringComparison.OrdinalIgnoreCase
    )
    ||
    role.Name.Equals(
        "Management",
        StringComparison.OrdinalIgnoreCase
    )
    ||
    (
        role.Name.Equals(
            "Admin Office",
            StringComparison.OrdinalIgnoreCase
        )
        &&
        !updatedUser.CollegeId.HasValue
    );

if (isAllCollegeRole)
{
    user.CollegeId = null;
}
else
{
    if (!updatedUser.CollegeId.HasValue)
    {
        return BadRequest(
            "College is required for this role."
        );
    }

    var collegeExists =
        await _context.Colleges.AnyAsync(
            x =>
                x.Id == updatedUser.CollegeId.Value &&
                x.IsActive
        );

    if (!collegeExists)
    {
        return BadRequest(
            "Invalid or inactive college selected."
        );
    }

    user.CollegeId =
        updatedUser.CollegeId;
}

        // -------------------------------------------------
        // Basic Details
        // -------------------------------------------------

        user.FullName =
            updatedUser.FullName;

        user.Email =
            updatedUser.Email;

        user.PhoneNumber =
            updatedUser.PhoneNumber;

        user.RoleId =
            updatedUser.RoleId;


// =====================================================
// UPDATE ASSIGNED YEAR
// =====================================================

if (role.Name.Equals("Class Incharge", StringComparison.OrdinalIgnoreCase))
{
    if (string.IsNullOrWhiteSpace(updatedUser.AssignedYear))
    {
        return BadRequest("Assigned Year is required for Class Incharge.");
    }

    user.AssignedYear = updatedUser.AssignedYear;
}
else
{
    user.AssignedYear = null;
}
 // =====================================================
// UPDATE COLLEGE
// =====================================================

user.CollegeId =
    updatedUser.CollegeId;


// =====================================================
// UPDATE MODULE
// =====================================================

user.Module =
    updatedUser.Module;


// =====================================================
// UPDATE PERMISSIONS
// =====================================================

user.IsSystemAdmin =
    role.Name == "System Admin";

var modules = (updatedUser.Module ?? "")
    .Split(
        ',',
        StringSplitOptions.RemoveEmptyEntries
    )
    .Select(x => x.Trim())
    .ToList();

if (role.Name == "Management")
{
    // Management always has everything
    user.Module = "Hostel,Transport";

    user.CanManageTransport = true;
    user.CanManageBoysHostel = true;
    user.CanManageGirlsHostel = true;

    user.HostelApprovalLevel = "All";
}
else
{
    // ---------------------------------------------
    // TRANSPORT
    // ---------------------------------------------

    user.CanManageTransport =
        modules.Contains("Transport");


    // ---------------------------------------------
    // HOSTEL
    // ---------------------------------------------

    if (modules.Contains("Hostel"))
    {
        user.CanManageBoysHostel =
            updatedUser.CanManageBoysHostel;

        user.CanManageGirlsHostel =
            updatedUser.CanManageGirlsHostel;

        user.HostelApprovalLevel =
            updatedUser.HostelApprovalLevel;

        if (
            !user.CanManageBoysHostel &&
            !user.CanManageGirlsHostel
        )
        {
            return BadRequest(
                "Please select Boys Hostel or Girls Hostel."
            );
        }

        if (
            string.IsNullOrWhiteSpace(
                user.HostelApprovalLevel
            )
        )
        {
            return BadRequest(
                "Please select an approval level."
            );
        }
    }
    else
    {
        user.CanManageBoysHostel = false;
        user.CanManageGirlsHostel = false;
        user.HostelApprovalLevel = null;
    }
}

        // -------------------------------------------------
        // Password
        // -------------------------------------------------

        if (
            !string.IsNullOrWhiteSpace(
                updatedUser.PasswordHash
            )
        )
        {
            user.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    updatedUser.PasswordHash
                );
        }


        // -------------------------------------------------
        // Activity Log
        // -------------------------------------------------

        var currentUserId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

        var currentUser =
            await _context.Users
                .FirstOrDefaultAsync(x =>
                    x.Id.ToString() ==
                    currentUserId
                );


        _context.ActivityLogs.Add(
            new ActivityLog
            {
                UserId =
                    currentUser?.Id ?? 0,

                UserName =
                    currentUser?.FullName ??
                    "System Admin",

                Action =
                    $"Updated user {user.FullName}",

                Module = "Users",

                CreatedAt = DateTime.Now
            }
        );


        await _context.SaveChangesAsync();


     return Ok(new
{
    user.Id,
    user.UserId,
    user.FullName,
    user.Email,
    user.PhoneNumber,

    user.RoleId,
    Role = role.Name,

    user.CollegeId,

    College =
        user.CollegeId.HasValue
            ? await _context.Colleges
                .Where(x =>
                    x.Id ==
                    user.CollegeId.Value)
                .Select(x => x.Name)
                .FirstOrDefaultAsync()
            : "All Colleges",

    user.AssignedYear,

    user.IsActive
});
    }


    // =====================================================
    // DELETE USER
    // SYSTEM ADMIN ONLY
    // =====================================================

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(
        int id)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == id);

        if (user == null)
        {
            return NotFound();


        }
        if (user.RoleId == 1002)
{
    return BadRequest(
        "Management accounts cannot be deleted."
    );
}
            if (
    string.Equals(
        user.UserId,
        ProtectedManagementUserId,
        StringComparison.OrdinalIgnoreCase
    )
)
{
    return BadRequest(
        "The Management account cannot be deleted."
    );
}

        // Prevent deleting yourself
        var currentUserId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

        if (
            currentUserId ==
            user.Id.ToString()
        )
        {
            return BadRequest(
                "You cannot delete your own account."
            );
        }


        _context.Users.Remove(user);

        await _context.SaveChangesAsync();

        return Ok();
    }


    // =====================================================
    // GET SINGLE USER
    // SYSTEM ADMIN ONLY
    // =====================================================

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(
        int id)
    {
        var user = await _context.Users
            .Include(x => x.Role)
            .Include(x => x.College)
            .FirstOrDefaultAsync(
                x => x.Id == id
            );

        if (user == null)
        {
            return NotFound();
        }

       return Ok(new
{
    user.Id,
    user.UserId,
    user.FullName,
    user.Email,
    user.PhoneNumber,

    user.RoleId,
    Role = user.Role?.Name,

    user.CollegeId,
    College = user.College?.Name ??
              "All Colleges",

    user.AssignedYear,

    user.IsActive,
    user.LastLogin
});
    }


    // =====================================================
    // CHANGE PASSWORD
    // SYSTEM ADMIN ONLY
    // =====================================================
[HttpPost("change-password/{id}")]
public async Task<IActionResult> ChangePassword(
    int id,
    ChangePasswordDto dto)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(x => x.Id == id);

    if (user == null)
    {
        return NotFound();
    }

    // Current logged-in user
    var currentUserId =
        User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

 

    bool validPassword =
        BCrypt.Net.BCrypt.Verify(
            dto.CurrentPassword,
            user.PasswordHash
        );

    if (!validPassword)
    {
        return BadRequest(
            "Current Password Incorrect"
        );
    }

    user.PasswordHash =
        BCrypt.Net.BCrypt.HashPassword(
            dto.NewPassword
        );

    await _context.SaveChangesAsync();

    return Ok(
        "Password Updated"
    );
}


    // =====================================================
    // DISABLE USER
    // SYSTEM ADMIN ONLY
    // =====================================================

    [HttpPut("disable/{id}")]
    public async Task<IActionResult> DisableUser(
        int id)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(
                x => x.Id == id
            );

        if (user == null)
        {
            return NotFound();
        }
if (
    string.Equals(
        user.UserId,
        ProtectedManagementUserId,
        StringComparison.OrdinalIgnoreCase
    )
)
{
    return BadRequest(
        "The Management account cannot be disabled."
    );
}

        var currentUserId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

        if (
            currentUserId ==
            user.Id.ToString()
        )
        {
            return BadRequest(
                "You cannot disable your own account."
            );
        }


        user.IsActive = false;


        _context.ActivityLogs.Add(
            new ActivityLog
            {
                UserId =
                    int.TryParse(
                        currentUserId,
                        out var currentId
                    )
                    ? currentId
                    : 0,

                UserName =
                    User.Identity?.Name ??
                    "System Admin",

                Action =
                    $"Disabled user {user.FullName}",

                Module = "Users",

                CreatedAt = DateTime.Now
            }
        );


        await _context.SaveChangesAsync();

        return Ok();
    }


    // =====================================================
    // ENABLE USER
    // SYSTEM ADMIN ONLY
    // =====================================================

    [HttpPut("enable/{id}")]
    public async Task<IActionResult> EnableUser(
        int id)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(
                x => x.Id == id
            );

        if (user == null)
        {
            return NotFound();
        }


        user.IsActive = true;


        var currentUserId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );


        _context.ActivityLogs.Add(
            new ActivityLog
            {
                UserId =
                    int.TryParse(
                        currentUserId,
                        out var currentId
                    )
                    ? currentId
                    : 0,

                UserName =
                    User.Identity?.Name ??
                    "System Admin",

                Action =
                    $"Enabled user {user.FullName}",

                Module = "Users",

                CreatedAt = DateTime.Now
            }
        );


        await _context.SaveChangesAsync();

        return Ok();
    }
}