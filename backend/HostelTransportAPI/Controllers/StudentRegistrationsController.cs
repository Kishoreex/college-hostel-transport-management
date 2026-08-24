using HostelTransportAPI.Services;
using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;
using HostelTransportAPI.DTOs;
using HostelTransportAPI.Models;
using Microsoft.AspNetCore.SignalR;
using HostelTransportAPI.Hubs;

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
public IActionResult GetAll()
{
    var data = _context.StudentRegistrations
        .Where(x => x.Status == "Pending")
        .OrderByDescending(x => x.Id)
        .ToList();

    return Ok(data);
}
[HttpGet("approved")]
public IActionResult GetApprovedStudents()
{
    var data = _context.StudentRegistrations
        .Where(x => x.Status == "Approved")
        .OrderBy(x => x.StudentName)
        .Select(x => new
        {
            x.Id,
            x.StudentId,
            x.StudentName,
            x.Phone,
            x.CollegeName,
            x.Department,
            x.Year,
            x.Batch,
            x.ParentName,
            x.ParentPhone,
            x.Address,
            x.Gender
        })
        .ToList();

    return Ok(data);
}
    [HttpPost("approve/{id}")]
    public async Task<IActionResult> ApproveStudent(int id)
    {
        var registration = await _context.StudentRegistrations.FindAsync(id);

        if (registration == null)
            return NotFound("Student Registration Not Found");

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
registration.Status = "Approved";
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

  Use The Link : https://campus.madhapharma.in/

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
{
    var registration =
        await _context.StudentRegistrations.FindAsync(id);

    if (registration == null)
        return NotFound("Student Registration Not Found");

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
public IActionResult GetHistory()
{
    var history = _context.StudentRegistrations
        .Where(x => x.Status != "Pending")
        .OrderByDescending(x => x.Id)
        .ToList();

    return Ok(history);
}
}