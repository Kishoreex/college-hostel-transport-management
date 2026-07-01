namespace HostelTransportAPI.Models;

public class TransportCancellation
{
    public int Id { get; set; }

    public string StudentId { get; set; } = "";

    public string StudentName { get; set; } = "";

    public string CollegeName { get; set; } = "";

    public string Department { get; set; } = "";

    public string Year { get; set; } = "";

    public string Batch { get; set; } = "";

    public string Phone { get; set; } = "";

    public string BusRoute { get; set; } = "";

    public string BusNumber { get; set; } = "";

    public string PickupPoint { get; set; } = "";

    public string Reason { get; set; } = "";

    public string Status { get; set; } = "Pending";

    public DateTime RequestedAt { get; set; } = DateTime.Now;
}