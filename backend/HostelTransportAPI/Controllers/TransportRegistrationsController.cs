using HostelTransportAPI.Services;
using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;
using HostelTransportAPI.DTOs;
using HostelTransportAPI.Models;


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

    TokenNumber = "TRN" + DateTime.Now.Year +
              Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper(),
    Status = "Pending"
};

        _context.TransportRegistrations.Add(registration);

        await _context.SaveChangesAsync();

        return Ok(registration);
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_context.TransportRegistrations.ToList());
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

// SEND EMAIL HERE
var emailService = new EmailService();

await emailService.SendEmailAsync(
    registration.Email,
    "Transport Registration Approved",
    $@"
Dear {registration.StudentName},

Your transport registration has been approved.

Login ID : {userId}

Password : {password}

Please change your password after first login.

Regards,
Transport Administration
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
}