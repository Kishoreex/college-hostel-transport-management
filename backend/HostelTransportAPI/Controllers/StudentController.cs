using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Data;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public StudentController(ApplicationDbContext context)
    {
        _context = context;
    }

  [HttpGet("{studentId}")]
public async Task<IActionResult> GetStudent(string studentId)
{
       var user = await _context.Users
        .FirstOrDefaultAsync(x => x.UserId == studentId);
    // Check Hostel Student
    var hostelStudent = await _context.StudentRegistrations
        .FirstOrDefaultAsync(x => x.StudentId == studentId);

    if (hostelStudent != null)
    {
        var room = await _context.HostelRoomAllocations
            .FirstOrDefaultAsync(x => x.StudentId == studentId);

        return Ok(new
        {
            studentId = hostelStudent.StudentId,
            studentName = hostelStudent.StudentName,
            collegeName = hostelStudent.CollegeName,
            department = hostelStudent.Department,
            year = hostelStudent.Year,
            batch = hostelStudent.Batch,
            phone = hostelStudent.Phone,
            parentName = hostelStudent.ParentName,
            parentPhone = hostelStudent.ParentPhone,
            address = hostelStudent.Address,
            gender = hostelStudent.Gender,
           profilePhoto = user?.ProfilePhoto,

            block = room?.Block,
            roomNumber = room?.RoomNumber,
            bedNumber = room?.BedNumber
        });
    }

    // Check Transport Student
   var transportStudent = await _context.TransportRegistrations
    .FirstOrDefaultAsync(x => x.StudentId == studentId);

if (transportStudent != null)
{
    return Ok(new
    {
        studentId = transportStudent.StudentId,
        studentName = transportStudent.StudentName,
        collegeName = transportStudent.CollegeName,
        department = transportStudent.Department,
        year = transportStudent.Year,
        batch = transportStudent.Batch,
        phone = transportStudent.Phone,
        parentName = transportStudent.ParentName,
        parentPhone = transportStudent.ParentPhone,
        address = transportStudent.Address,
        gender = transportStudent.Gender,

       profilePhoto = user?.ProfilePhoto,

        block = "",
        roomNumber = "",
        bedNumber = ""
    });
}

return NotFound();

    
}
[HttpPost("{studentId}/profile-photo")]
public async Task<IActionResult> UploadPhoto(
    string studentId,
    IFormFile file)
{
    if (file == null || file.Length == 0)
        return BadRequest("No photo selected.");

    var uploadsFolder = Path.Combine(
        Directory.GetCurrentDirectory(),
        "wwwroot",
        "profilephotos");

    if (!Directory.Exists(uploadsFolder))
        Directory.CreateDirectory(uploadsFolder);

    var fileName =
        $"{studentId}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

    var filePath =
        Path.Combine(uploadsFolder, fileName);

    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    var photoPath = "/profilephotos/" + fileName;
var user = await _context.Users
    .FirstOrDefaultAsync(x => x.UserId == studentId);

if (user == null)
    return NotFound();

user.ProfilePhoto = photoPath;

await _context.SaveChangesAsync();

return Ok(new
{
    profilePhoto = photoPath
});
}
}