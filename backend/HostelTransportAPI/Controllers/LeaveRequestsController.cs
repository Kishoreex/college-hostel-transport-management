using Microsoft.AspNetCore.Mvc;
using HostelTransportAPI.Data;
using HostelTransportAPI.DTOs;
using HostelTransportAPI.Models;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaveRequestsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LeaveRequestsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateLeaveRequestDto dto)
    {
        var leaveRequest = new LeaveRequest
        {
            StudentId = dto.StudentId,
            LeaveType = dto.LeaveType,
            CampusStatus = dto.CampusStatus,
            FromDate = dto.FromDate,
            ToDate = dto.ToDate,
            Reason = dto.Reason
        };

        _context.LeaveRequests.Add(leaveRequest);
        var systemAdmins = _context.Users
    .Where(x => x.IsSystemAdmin)
    .ToList();

foreach (var admin in systemAdmins)
{
    _context.Notifications.Add(
        new Notification
        {
            UserId = admin.Id,
            Title = "New Leave Request",
            Message = $"{dto.StudentId} submitted leave request",
            Type = "Leave",
            IsRead = false,
            CreatedAt = DateTime.Now
        });
}

        await _context.SaveChangesAsync();

        return Ok(leaveRequest);
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_context.LeaveRequests.ToList());
    }

    [HttpPost("approve/{id}")]
    public async Task<IActionResult> Approve(int id)
    {
        var leave = await _context.LeaveRequests.FindAsync(id);

        if (leave == null)
            return NotFound("Leave Request Not Found");

        leave.Status = "Approved";
        leave.ApprovedDate = DateTime.UtcNow;
        leave.ApprovedBy = "Admin";
        _context.ActivityLogs.Add(
    new ActivityLog
    {
        UserId = 6,
        UserName = "Main Administrator",
        Action = $"Approved leave request {leave.Id}",
        Module = "Leave",
        CreatedAt = DateTime.Now
    });
        _context.ActivityLogs.Add(
    new ActivityLog
    {
        UserId = 6,
        UserName = "Main Administrator",
        Action = $"Approved leave request #{leave.Id}",
        Module = "Leave",
        CreatedAt = DateTime.Now
    });
       if (leave.CampusStatus == "Out Campus")
{
    var outpass = new Outpass
    {
        OutpassNumber = $"OP{DateTime.Now:yyyyMMddHHmmss}",
        StudentId = leave.StudentId,
        LeaveRequestId = leave.Id,
        ValidFrom = leave.FromDate,
        ValidTo = leave.ToDate,
        Status = "Active"
    };

    _context.Outpasses.Add(outpass);

    _context.ActivityLogs.Add(
        new ActivityLog
        {
            UserId = 6,
            UserName = "Main Administrator",
            Action = $"Created outpass {outpass.OutpassNumber}",
            Module = "Outpass",
            CreatedAt = DateTime.Now
        });
}

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Message = "Leave Approved"
        });
    }

    [HttpPost("reject/{id}")]
    public async Task<IActionResult> Reject(int id)
    {
        var leave = await _context.LeaveRequests.FindAsync(id);

        if (leave == null)
            return NotFound("Leave Request Not Found");

        leave.Status = "Rejected";
        leave.ApprovedDate = DateTime.UtcNow;
        leave.ApprovedBy = "Admin";
        _context.ActivityLogs.Add(
    new ActivityLog
    {
        UserId = 6,
        UserName = "Main Administrator",
        Action = $"Rejected leave request #{leave.Id}",
        Module = "Leave",
        CreatedAt = DateTime.Now
    });

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Message = "Leave Rejected"
        });
    }
}