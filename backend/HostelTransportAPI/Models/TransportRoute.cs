namespace HostelTransportAPI.Models;

public class TransportRoute
{
    public int Id { get; set; }

    public string RouteName { get; set; } = "";

    public string BusNumber { get; set; } = "";

    public string DriverName { get; set; } = "";

    public string DriverPhone { get; set; } = "";

    public TimeSpan MorningTime { get; set; }

    public TimeSpan EveningTime { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<TransportStop> Stops { get; set; }
        = new List<TransportStop>();
}