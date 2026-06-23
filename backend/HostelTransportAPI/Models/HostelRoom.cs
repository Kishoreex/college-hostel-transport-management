namespace HostelTransportAPI.Models;

public class HostelRoom
{
    public int Id { get; set; }

    public string Gender { get; set; } = "";

    public string Block { get; set; } = "";

    public string RoomNumber { get; set; } = "";

    public int Capacity { get; set; }

    public string Status { get; set; } = "Available";
}