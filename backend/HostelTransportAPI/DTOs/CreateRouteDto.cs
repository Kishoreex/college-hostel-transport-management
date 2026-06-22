public class CreateRouteDto
{
    public string RouteName { get; set; }

    public string BusNumber { get; set; }

    public string DriverName { get; set; }

    public string DriverPhone { get; set; }

    public TimeSpan MorningTime { get; set; }

    public TimeSpan EveningTime { get; set; }

    public List<CreateStopDto> Stops { get; set; }
}