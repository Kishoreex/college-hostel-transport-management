using HostelTransportAPI.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HostelTransportAPI.Data;
using HostelTransportAPI.DTOs;
using HostelTransportAPI.Models;
using Microsoft.AspNetCore.SignalR;
using HostelTransportAPI.Hubs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentRegistrationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
private readonly IHubContext<NotificationHub> _hub;

   public StudentRegistrationsController(
    ApplicationDbContext context,
    IHubContext<NotificationHub> hub)
{
    _context = context;
    _hub = hub;
}
private async Task<string?> GetAllowedCollegeAsync()
{
    var role =
        User.FindFirst(ClaimTypes.Role)?.Value
        ?? User.FindFirst("role")?.Value;

    var userId =
        User.FindFirst(ClaimTypes.Name)?.Value
        ?? User.FindFirst("userId")?.Value
        ?? User.FindFirst("UserId")?.Value;

    if (string.IsNullOrWhiteSpace(role) ||
        string.IsNullOrWhiteSpace(userId))
    {
        return "__NO_ACCESS__";
    }

    role = role.Trim();
    userId = userId.Trim();

    // Management = ALL COLLEGES
    if (role.Equals(
        "Management",
        StringComparison.OrdinalIgnoreCase))
    {
        return null;
    }

    // Find logged-in staff user
    var staffUser = await _context.Users
        .FirstOrDefaultAsync(x =>
            x.UserId == userId);

    if (staffUser == null)
    {
        return "__NO_ACCESS__";
    }

    // Class Incharge / Hostel Incharge /
    // Admin Office / Principal
    // are restricted to their assigned college.
    if (
        role.Equals("Class Incharge",
            StringComparison.OrdinalIgnoreCase) ||
        role.Equals("Hostel Incharge",
            StringComparison.OrdinalIgnoreCase) ||
        role.Equals("Admin Office",
            StringComparison.OrdinalIgnoreCase) ||
        role.Equals("Principal",
            StringComparison.OrdinalIgnoreCase)
    )
    {
        if (!staffUser.CollegeId.HasValue ||
            staffUser.CollegeId.Value == 0)
        {
            return "__NO_ACCESS__";
        }

        var college = await _context.Colleges
            .Where(c => c.Id == staffUser.CollegeId.Value)
            .Select(c => c.Name)
            .FirstOrDefaultAsync();

        if (string.IsNullOrWhiteSpace(college))
        {
            return "__NO_ACCESS__";
        }

        return college;
    }

    return "__NO_ACCESS__";
}private async Task<string?> GetAllowedYearAsync()
{
    var role =
        User.FindFirst(ClaimTypes.Role)?.Value
        ?? User.FindFirst("role")?.Value;
var userId =
    User.FindFirst(ClaimTypes.Name)?.Value
    ?? User.FindFirst("userId")?.Value
    ?? User.FindFirst("UserId")?.Value;

    if (string.IsNullOrWhiteSpace(role) ||
        string.IsNullOrWhiteSpace(userId))
    {
        return null;
    }

    role = role.Trim();

    // Only Class Incharge has year restriction
    if (!role.Equals(
        "Class Incharge",
        StringComparison.OrdinalIgnoreCase))
    {
        return null;
    }

    var staffUser = await _context.Users
        .FirstOrDefaultAsync(x =>
            x.UserId == userId);

    if (staffUser == null)
        return null;

    return staffUser.AssignedYear;
}
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateStudentRegistrationDto dto)
    {
        var registration = new StudentRegistration
{
    RegistrationType = dto.RegistrationType,

    CollegeName = dto.CollegeName,
    Department = dto.Department,
    Year = dto.Year,
    Batch = dto.Batch,
    Gender = dto.Gender,

    StudentName = dto.StudentName,
    RegisterNumber = dto.RegisterNumber,
    Email = dto.Email,
    Phone = dto.Phone,

    ParentName = dto.ParentName,
    ParentPhone = dto.ParentPhone,
    Address = dto.Address,

    TokenNumber = $"HTL{DateTime.Now:yyyy}{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
    Status = "Pending"
};

        _context.StudentRegistrations.Add(registration);

      await _context.SaveChangesAsync();

await _hub.Clients.All.SendAsync(
    "HostelApplicationCreated"
);

return Ok(registration);
    }
[HttpGet]
public async Task<IActionResult> GetAll()
{
    var allowedCollege = await GetAllowedCollegeAsync();
    var allowedYear = await GetAllowedYearAsync();

    if (allowedCollege == "__NO_ACCESS__")
    {
        return Forbid();
    }

    var query = _context.StudentRegistrations
        .Where(x => x.Status == "Pending");

    // College restriction
    if (!string.IsNullOrWhiteSpace(allowedCollege))
    {
        query = query.Where(x =>
            x.CollegeName == allowedCollege);
    }

    // Class Incharge year restriction
    if (!string.IsNullOrWhiteSpace(allowedYear))
    {
        query = query.Where(x =>
            x.Year == allowedYear);
    }

    var data = await query
        .OrderByDescending(x => x.Id)
        .ToListAsync();

    return Ok(data);
}
[HttpGet("approved")]
public async Task<IActionResult> GetApprovedStudents(
    [FromQuery] string? college)
{
    var allowedCollege = await GetAllowedCollegeAsync();
    var allowedYear = await GetAllowedYearAsync();

    if (allowedCollege == "__NO_ACCESS__")
    {
        return Forbid();
    }

    var query = _context.StudentRegistrations
        .Where(x =>
            x.IsApproved &&
            x.Status == "Active");

    // ---------------------------------------------------------
    // COLLEGE SECURITY
    // ---------------------------------------------------------
    // Management = all colleges
    // Other allowed staff = their college only
    // ---------------------------------------------------------

    if (!string.IsNullOrWhiteSpace(allowedCollege))
    {
        query = query.Where(x =>
            x.CollegeName == allowedCollege);
    }
    else if (!string.IsNullOrWhiteSpace(college))
    {
        // Management can optionally filter by college
        query = query.Where(x =>
            x.CollegeName == college);
    }

    // ---------------------------------------------------------
    // CLASS INCHARGE YEAR SECURITY
    // ---------------------------------------------------------
    // Example:
    // Class Incharge -> 1st Year
    // Only 1st Year students are returned.
    // ---------------------------------------------------------

    if (!string.IsNullOrWhiteSpace(allowedYear))
    {
        query = query.Where(x =>
            x.Year == allowedYear);
    }

    var data = await query
        .OrderBy(x => x.StudentName)
        .Select(x => new
        {
            x.Id,
            x.StudentId,
            x.StudentName,
            x.RegisterNumber,
            x.Phone,
            x.CollegeName,
            x.Department,
            x.Year,
            x.Batch,
            x.ParentName,
            x.ParentPhone,
            x.Address,
            x.Gender,
            x.Email,
            x.Status,
            x.IsApproved
        })
        .ToListAsync();

    return Ok(data);
}
    [HttpPost("approve/{id}")]
    public async Task<IActionResult> ApproveStudent(int id)
    
    {

        var allowedCollege = await GetAllowedCollegeAsync();

if (allowedCollege == "__NO_ACCESS__")
{
    return Forbid();
}
        var registration = await _context.StudentRegistrations.FindAsync(id);

        if (registration == null)
            return NotFound("Student Registration Not Found");


            if (!string.IsNullOrWhiteSpace(allowedCollege) &&
    !registration.CollegeName.Equals(
        allowedCollege,
        StringComparison.OrdinalIgnoreCase))
{
    return Forbid();
}

        if (registration.IsApproved)
            return BadRequest("Already Approved");

       string userId =
    StudentIdGenerator.GenerateStudentId(
        _context,
        registration.CollegeName
    );

      string password =
    $"Stu@{Random.Shared.Next(100000,999999)}";

        string passwordHash =
            BCrypt.Net.BCrypt.HashPassword(password);

        var studentRole = _context.Roles
            .FirstOrDefault(r => r.Name == "Student");

        if (studentRole == null)
            return BadRequest("Student Role Not Found");

        var user = new User
{
    UserId = userId,
    FullName = registration.StudentName,
    Email = registration.Email,
    PasswordHash = passwordHash,
    RoleId = studentRole.Id,
    Module = "Hostel",
    IsActive = true
};
_context.Users.Add(user);
var parentRole = _context.Roles
    .FirstOrDefault(x => x.Name == "Parent");
    if (parentRole == null)
    return BadRequest("Parent Role Not Found");

string parentUserId = "P" + userId;

string parentPassword =
    $"Par@{Random.Shared.Next(100000,999999)}";

var parentUser = new User
{
    UserId = parentUserId,
    FullName = registration.ParentName,
    Email = registration.Email,
    PasswordHash = BCrypt.Net.BCrypt.HashPassword(parentPassword),

    RoleId = parentRole!.Id,

   Module = "Parent",

    IsActive = true,

    StudentId = userId
};

_context.Users.Add(parentUser);
registration.ParentLoginId = parentUserId;

registration.ParentTemporaryPassword = parentPassword;



registration.IsApproved = true;
registration.Status = "Active";
registration.ApprovedDate = DateTime.Now;
registration.StudentId = userId;

await _context.SaveChangesAsync();
await _hub.Clients.All.SendAsync(
    "HostelApplicationUpdated",
    registration.StudentId
);
// // SEND EMAIL
var emailService = new EmailService();

await emailService.SendEmailAsync(
    registration.Email,
    "Hostel Registration Approved – College Hostel Management System",
    $@"
Dear {registration.StudentName},

Congratulations!

Your hostel registration has been successfully approved by the Hostel Administration.

LOGIN DETAILS :-

    STUDENT LOGIN :

        User ID : {userId}
        Password : {password}

    PARENT LOGIN:

        User ID : {parentUserId}
        Password : {parentPassword}

  Use The Link : https://play.google.com/store/apps/details?id=com.mdch.hosteltransport

  web portal : https://campus.madhapharma.in/

    The link is valid only if u download the app from playstore using the email id used for registration. 
    Make sure on play store u have loged in with the same email id used for registration.before using the link. 
    If you have any issues and doubts, please contact the Hostel Administration.
    

IMPORTANT:
• Please log in using the credentials above.
• Keep your login credentials confidential and do not share them with anyone.

 You can now access the Hostel Management Portal to:

    • Apply for Outpasses
    • Submit Leave Requests
    • View Hostel Information
    • Track Request Status

If you experience any issues accessing your account, please contact the Hostel Administration Office.

Thank you for being a part of our hostel community.

Kind Regards,

Hostel Administration
MADHA CAMPUS
");

return Ok(new
{
    Message = "Student Approved Successfully",

    StudentUserId = userId,
    StudentPassword = password,

    ParentUserId = parentUserId,
    ParentPassword = parentPassword
});
    }

    [HttpPost("reject/{id}")]
public async Task<IActionResult> RejectStudent(int id)
{var allowedCollege = await GetAllowedCollegeAsync();

if (allowedCollege == "__NO_ACCESS__")
{
    return Forbid();
}
    var registration =
        await _context.StudentRegistrations.FindAsync(id);

    if (registration == null)
        return NotFound("Student Registration Not Found");
        if (!string.IsNullOrWhiteSpace(allowedCollege) &&
    !registration.CollegeName.Equals(
        allowedCollege,
        StringComparison.OrdinalIgnoreCase))
{
    return Forbid();
}

    registration.Status = "Rejected";
    registration.RejectedDate = DateTime.Now;

    await _context.SaveChangesAsync();

await _hub.Clients.All.SendAsync(
    "HostelApplicationUpdated",
    registration.StudentId
);

return Ok(new
    {
        Message = "Student Rejected Successfully"
    });
}

[HttpGet("history")]
public async Task<IActionResult> GetHistory()
{
    var allowedCollege = await GetAllowedCollegeAsync();
    var allowedYear = await GetAllowedYearAsync();

    if (allowedCollege == "__NO_ACCESS__")
    {
        return Forbid();
    }

    var query = _context.StudentRegistrations
        .Where(x => x.Status != "Pending");

    // College restriction
    if (!string.IsNullOrWhiteSpace(allowedCollege))
    {
        query = query.Where(x =>
            x.CollegeName == allowedCollege);
    }

    // Class Incharge year restriction
    if (!string.IsNullOrWhiteSpace(allowedYear))
    {
        query = query.Where(x =>
            x.Year == allowedYear);
    }

    var history = await query
        .OrderByDescending(x => x.Id)
        .ToListAsync();

    return Ok(history);
}
}