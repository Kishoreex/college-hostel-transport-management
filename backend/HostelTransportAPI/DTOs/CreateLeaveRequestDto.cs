namespace HostelTransportAPI.DTOs;

public class CreateLeaveRequestDto
{
    public string StudentId { get; set; } = string.Empty;

    public string LeaveType { get; set; } = string.Empty;

    public string CampusStatus { get; set; } = string.Empty;

    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public string Reason { get; set; } = string.Empty;
}