using HostelTransportAPI.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HostelTransportAPI.Data;
using HostelTransportAPI.DTOs;
using HostelTransportAPI.Models;
using Microsoft.AspNetCore.SignalR;
using HostelTransportAPI.Hubs;
using Microsoft.EntityFrameworkCore;

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
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst("userId")?.Value
        ?? User.FindFirst("UserId")?.Value;

    if (string.IsNullOrWhiteSpace(role) ||
        string.IsNullOrWhiteSpace(userId))
    {
        return null;
    }

    role = role.Trim();

    // Management = ALL COLLEGES
    if (role.Equals("Management", StringComparison.OrdinalIgnoreCase))
    {
        return null;
    }

    // Find logged-in staff user
    var staffUser = await _context.Users
        .Include(u => u.Role)
        .FirstOrDefaultAsync(u =>
            u.UserId == userId);

    if (staffUser == null)
        return null;

    // Admin Office with CollegeId = 0 = ALL COLLEGES
    if (role.Equals("Admin Office", StringComparison.OrdinalIgnoreCase))
    {
        if (staffUser.CollegeId == null ||
            staffUser.CollegeId == 0)
        {
            return null;
        }

        var college = await _context.Colleges
            .Where(c => c.Id == staffUser.CollegeId)
            .Select(c => c.Name)
            .FirstOrDefaultAsync();

        return college;
    }

    // Everyone else has no access to admissions
    return "__NO_ACCESS__";
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

    if (allowedCollege == "__NO_ACCESS__")
    {
        return Forbid();
    }

    var query = _context.StudentRegistrations
        .Where(x => x.Status == "Pending");

    // null = ALL COLLEGES
    if (!string.IsNullOrWhiteSpace(allowedCollege))
    {
        query = query.Where(x =>
            x.CollegeName == allowedCollege);
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
    var query = _context.StudentRegistrations
        .Where(x =>
            x.IsApproved &&
            x.Status == "Active");

    // If college is provided, show only that college.
    // If college is empty/null, show all colleges.
    if (!string.IsNullOrWhiteSpace(college))
    {
        query = query.Where(x =>
            x.CollegeName == college);
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
Madha College of Nursing
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
}[HttpGet("history")]
public async Task<IActionResult> GetHistory()
{
    var allowedCollege = await GetAllowedCollegeAsync();

    if (allowedCollege == "__NO_ACCESS__")
    {
        return Forbid();
    }

    var query = _context.StudentRegistrations
        .Where(x => x.Status != "Pending");

    // null = ALL COLLEGES
    if (!string.IsNullOrWhiteSpace(allowedCollege))
    {
        query = query.Where(x =>
            x.CollegeName == allowedCollege);
    }

    var history = await query
        .OrderByDescending(x => x.Id)
        .ToListAsync();

    return Ok(history);
}
}