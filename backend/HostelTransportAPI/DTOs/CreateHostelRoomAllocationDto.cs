namespace HostelTransportAPI.DTOs;

public class CreateHostelRoomAllocationDto
{
    public string StudentId { get; set; } = "";
    public string Block { get; set; } = "";
    public string RoomNumber { get; set; } = "";
    public string BedNumber { get; set; } = "";
}