namespace HostelTransportAPI.Models;

public class ActivityLog
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string UserName { get; set; }

    public string Action { get; set; }

    public string Module { get; set; }

    public DateTime CreatedAt { get; set; }
}