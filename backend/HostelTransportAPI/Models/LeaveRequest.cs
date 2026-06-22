namespace HostelTransportAPI.Models;

public class LeaveRequest
{
    public int Id { get; set; }

    public string StudentId { get; set; } = string.Empty;

    public string LeaveType { get; set; } = string.Empty;

    public string CampusStatus { get; set; } = string.Empty;

    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public string Reason { get; set; } = string.Empty;

    public string Status { get; set; } = "Pending";

    public DateTime AppliedDate { get; set; } = DateTime.UtcNow;

    public DateTime? ApprovedDate { get; set; }

    public string? ApprovedBy { get; set; }
}