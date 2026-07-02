using HostelTransportAPI.Services;
using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;
using HostelTransportAPI.DTOs;
using HostelTransportAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransportRegistrationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TransportRegistrationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateTransportRegistrationDto dto)
    {
  var registration = new TransportRegistration
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

    RouteId = dto.RouteId,
    StopId = dto.StopId,

    TokenNumber = "TRN" + DateTime.Now.Year +
                  Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper(),

    Status = "Pending",
    CreatedAt = DateTime.Now,
};

        _context.TransportRegistrations.Add(registration);

        await _context.SaveChangesAsync();

        return Ok(registration);
    }

   [HttpGet]
public async Task<IActionResult> GetAll()
{
    // Delete applications older than 24 hours
    var expired = await _context.TransportRegistrations
        .Where(x =>
            !x.IsApproved &&
            x.CreatedAt < DateTime.Now.AddHours(-24))
        .ToListAsync();

    if (expired.Any())
    {
        _context.TransportRegistrations.RemoveRange(expired);
        await _context.SaveChangesAsync();
    }

    var data = await _context.TransportRegistrations
        .Where(x =>
            x.CreatedAt >= DateTime.Now.AddHours(-24))
        .Include(x => x.Route)
        .Include(x => x.Stop)
        .Select(x => new
        {
            id = x.Id,
            studentId = x.StudentId,
            studentName = x.StudentName,
            tokenNumber = x.TokenNumber,
            collegeName = x.CollegeName,
            department = x.Department,
            year = x.Year,
            batch = x.Batch,
            phone = x.Phone,
            parentName = x.ParentName,
            parentPhone = x.ParentPhone,
            address = x.Address,
            status = x.Status,
            preferredRoute = x.Route != null ? x.Route.RouteName : "",
            pickupPoint = x.Stop != null ? x.Stop.StopName : "",
            appliedDate = x.TokenNumber
        })
        .ToListAsync();

    return Ok(data);
}
    [HttpPost("approve/{id}")]
    public async Task<IActionResult> ApproveStudent(int id)
    {
        var registration = await _context.TransportRegistrations.FindAsync(id);

        if (registration == null)
            return NotFound("Transport Registration Not Found");

        if (registration.IsApproved)
            return BadRequest("Already Approved");

        string userId = registration.RegisterNumber;

      string password =
    $"Tra@{Random.Shared.Next(100000,999999)}";

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
    Module = "Transport"
};
_context.Users.Add(user);

registration.IsApproved = true;
registration.Status = "Approved";
registration.StudentId = userId;

await _context.SaveChangesAsync();

// SEND EMAIL
var emailService = new EmailService();

await emailService.SendEmailAsync(
    registration.Email,
    "Transport Registration Approved – College Transport Management System",
    $@"
Dear {registration.StudentName},

Congratulations!

Your transport registration has been successfully approved by the Transport Administration.

----------------------------------------------------
LOGIN DETAILS
----------------------------------------------------

User ID : {userId}

Temporary Password : {password}

----------------------------------------------------
IMPORTANT
----------------------------------------------------

• Please log in using the credentials above.

• Keep your login credentials confidential and do not share them with anyone.

You can now access the Transport Management Portal to:

• View Your Bus Route

• View Assigned Bus Information

• View Pickup and Drop Stops

If you experience any issues accessing your account, please contact the Transport Administration Office.

Thank you for choosing the College Transport Service.

Kind Regards,

Transport Administration
Madha College of Nursing
");

return Ok(new
{
    Message = "Student Approved Successfully",
    UserId = userId,
    TemporaryPassword = password
});
    }

    [HttpPost("reject/{id}")]
public async Task<IActionResult> RejectStudent(int id)
{
    var registration =
        await _context.TransportRegistrations.FindAsync(id);

    if (registration == null)
        return NotFound("Transport Registration Not Found");

    registration.Status = "Rejected";

    await _context.SaveChangesAsync();

    return Ok(new
    {
        Message = "Student Rejected Successfully"
    });
}
[HttpGet("students")]
public async Task<IActionResult> GetApprovedStudents()
{
    var students = await _context.TransportRegistrations
        .Where(x => x.IsApproved)
        .Include(x => x.Route)
        .Include(x => x.Stop)
        .Select(x => new
        {
            id = x.Id,
            studentId = x.StudentId,
            studentName = x.StudentName,
            phone = x.Phone,

            collegeName = x.CollegeName,
            department = x.Department,
            year = x.Year,
            batch = x.Batch,

            parentName = x.ParentName,
            parentPhone = x.ParentPhone,
            address = x.Address,

            status = x.Status,
            isApproved = x.IsApproved,

            busRoute = x.Route != null ? x.Route.RouteName : "",
            busNumber = x.Route != null ? x.Route.BusNumber : "",
            pickupPoint = x.Stop != null ? x.Stop.StopName : "",
            pickupTime = x.Stop != null ? x.Stop.PickupTime.ToString(@"hh\:mm") : ""
        })
        .ToListAsync();

    return Ok(students);
}

[HttpGet("student/{studentId}")]
public IActionResult GetStudentTransport(string studentId)
{
    var student = _context.TransportRegistrations
        .Where(x =>
            x.StudentId == studentId &&
            x.IsApproved)
        .Select(x => new
        {
            x.StudentId,
            x.StudentName,

            RouteName = x.Route.RouteName,
            BusNumber = x.Route.BusNumber,

            DriverName = x.Route.DriverName,
            DriverPhone = x.Route.DriverPhone,

            StopName = x.Stop.StopName,
            PickupTime = x.Stop.PickupTime
        })
        .FirstOrDefault();

    if (student == null)
        return NotFound();

    return Ok(student);
}
}