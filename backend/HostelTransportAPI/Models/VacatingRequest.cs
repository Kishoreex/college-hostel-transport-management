namespace HostelTransportAPI.Models;

public class VacatingRequest
{
    public int Id { get; set; }

    public string StudentId { get; set; } = "";

    public string StudentName { get; set; } = "";

public string Gender { get; set; } = "";
public string Department { get; set; } = "";
public string Year { get; set; } = "";
public string Batch { get; set; } = "";
public string RoomNumber { get; set; } = "";
public string Phone { get; set; } = "";
    public string Reason { get; set; } = "";

    public string Status { get; set; } = "Pending";
    public DateTime? ApprovedDate { get; set; }

public DateTime? RejectedDate { get; set; }

    public DateTime RequestDate { get; set; }
}