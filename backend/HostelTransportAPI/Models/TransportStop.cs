namespace HostelTransportAPI.Models;

public class TransportStop
{
    public int Id { get; set; }

    public int RouteId { get; set; }

    public string StopName { get; set; } = "";

    public TimeSpan PickupTime { get; set; }

    public TransportRoute Route { get; set; } = null!;
}