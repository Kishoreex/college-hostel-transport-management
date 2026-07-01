namespace HostelTransportAPI.DTOs;

public class CreateTransportCancellationDto
{
    public string StudentId { get; set; } = "";

    public string StudentName { get; set; } = "";

    public string Reason { get; set; } = "";
}