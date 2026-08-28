using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminDashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminDashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // DASHBOARD SUMMARY
    // ONLY ACTIVE STUDENTS
    // =====================================================

    [HttpGet("summary")]
    public IActionResult Summary()
    {
        // =========================
        // HOSTEL STUDENTS
        // =========================

        var mdchHostel = _context.StudentRegistrations.Count(x =>
            x.Status == "Active" &&
            x.CollegeName == "Madha Dental College & Hospital");

        var mconHostel = _context.StudentRegistrations.Count(x =>
            x.Status == "Active" &&
            x.CollegeName == "Madha College of Nursing");

        var mcopHostel = _context.StudentRegistrations.Count(x =>
            x.Status == "Active" &&
            x.CollegeName == "Madha College of Physiotherapy");


        // =========================
        // TRANSPORT STUDENTS
        // =========================

        var mdchTransport = _context.TransportRegistrations.Count(x =>
            x.Status == "Active" &&
            x.CollegeName == "Madha Dental College & Hospital");

        var mconTransport = _context.TransportRegistrations.Count(x =>
            x.Status == "Active" &&
            x.CollegeName == "Madha College of Nursing");

        var mcopTransport = _context.TransportRegistrations.Count(x =>
            x.Status == "Active" &&
            x.CollegeName == "Madha College of Physiotherapy");


        // =========================
        // TOTALS
        // =========================

        var hostelStudents =
            mdchHostel +
            mconHostel +
            mcopHostel;

        var transportStudents =
            mdchTransport +
            mconTransport +
            mcopTransport;

        var totalStudents =
            hostelStudents +
            transportStudents;


        return Ok(new
        {
            totalStudents,

            hostelStudents,
            transportStudents,

            mdchHostel,
            mdchTransport,

            mconHostel,
            mconTransport,

            mcopHostel,
            mcopTransport
        });
    }


    // =====================================================
    // HOSTEL STUDENTS
    // ONLY ACTIVE STUDENTS
    // =====================================================

    [HttpGet("hostelStudents")]
    public IActionResult GetHostelStudents(string college)
    {
        var students = _context.StudentRegistrations
            .Where(x =>
                x.Status == "Active" &&
                x.CollegeName == college)
            .Select(x => new
            {
                x.StudentId,
                x.StudentName,
                x.Department,
                x.Year,
                x.Batch,
                x.Phone,
                x.Email,
                x.ParentName,
                x.ParentPhone,
                x.Address,
                x.CollegeName,

                RoomNumber = _context.HostelRoomAllocations
                    .Where(r => r.StudentId == x.StudentId)
                    .Select(r => r.RoomNumber)
                    .FirstOrDefault()
            })
            .OrderBy(x => x.StudentName)
            .ToList();

        return Ok(students);
    }


    // =====================================================
    // TRANSPORT STUDENTS
    // ONLY ACTIVE STUDENTS
    // =====================================================

    [HttpGet("transportStudents")]
    public IActionResult GetTransportStudents(string college)
    {
        var students = _context.TransportRegistrations
            .Where(x =>
                x.Status == "Active" &&
                x.CollegeName == college)
            .Select(x => new
            {
                x.StudentId,
                x.StudentName,
                x.Department,
                x.Year,
                x.Batch,
                x.Phone,
                x.Email,
                x.ParentName,
                x.ParentPhone,
                x.Address,
                x.CollegeName,

                BusRoute = x.Route != null
                    ? x.Route.RouteName
                    : "",

                BusNumber = x.Route != null
                    ? x.Route.BusNumber
                    : "",

                PickupPoint = x.Stop != null
                    ? x.Stop.StopName
                    : "",

                PickupTime = x.Stop != null
                    ? x.Stop.PickupTime.ToString(@"hh\:mm")
                    : ""
            })
            .OrderBy(x => x.StudentName)
            .ToList();

        return Ok(students);
    }
}