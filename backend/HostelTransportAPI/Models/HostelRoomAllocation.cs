namespace HostelTransportAPI.Models;
public class HostelRoomAllocation
{
    public int Id { get; set; }

    public string StudentId { get; set; } = "";

    public string StudentName { get; set; } = "";

    public string Gender { get; set; } = "";

    public string Block { get; set; } = "";

    public string RoomNumber { get; set; } = "";

    public string BedNumber { get; set; } = "";

    public DateTime AllocatedDate { get; set; }

    public string Status { get; set; } = "Allocated";
}