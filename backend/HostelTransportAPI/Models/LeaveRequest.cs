namespace HostelTransportAPI.Models;

public class LeaveRequest
{
    public int Id { get; set; }

    public string StudentId { get; set; } = string.Empty;

    public string StudentName { get; set; } = string.Empty;

    public string LeaveNumber { get; set; } = string.Empty;

    public string LeaveType { get; set; } = string.Empty;

    public string Campus { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Gender { get; set; } = string.Empty;

    public string Year { get; set; } = string.Empty;

    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public string Reason { get; set; } = string.Empty;
public string Destination { get; set; } = string.Empty;
public string ExitTime { get; set; } = "";

public string ReturnTime { get; set; } = "";
    public string Status { get; set; } = "Pending";

    public DateTime? ApprovedDate { get; set; }

    public string? ApprovedBy { get; set; }

    public string? RejectReason { get; set; }
}