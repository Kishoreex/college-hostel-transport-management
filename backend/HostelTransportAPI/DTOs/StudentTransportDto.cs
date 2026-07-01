namespace HostelTransportAPI.DTOs;

public class StudentTransportDto
{
    public string StudentId { get; set; } = "";
    public string StudentName { get; set; } = "";

    public string RouteName { get; set; } = "";
    public string BusNumber { get; set; } = "";

    public string DriverName { get; set; } = "";
    public string DriverPhone { get; set; } = "";

    public string StopName { get; set; } = "";
    public string PickupTime { get; set; } = "";
}