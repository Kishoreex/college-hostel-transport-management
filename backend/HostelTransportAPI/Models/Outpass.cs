namespace HostelTransportAPI.Models;

public class Outpass
{
    public int Id { get; set; }

    public string OutpassNumber { get; set; } = string.Empty;

    public string StudentId { get; set; } = string.Empty;

    public string StudentName { get; set; } = string.Empty;

    public string Gender { get; set; } = string.Empty;

    public string Destination { get; set; } = string.Empty;

    public string Reason { get; set; } = string.Empty;

    public string TimeOut { get; set; } = string.Empty;

    public string ReturnTime { get; set; } = string.Empty;

    public int LeaveRequestId { get; set; }

    public DateTime ValidFrom { get; set; }

    public DateTime ValidTo { get; set; }

    public string? Status { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? OutpassState { get; set; }

public DateTime? ActualExitTime { get; set; }

public DateTime? ActualReturnTime { get; set; }
public int? EarlyExitMinutes { get; set; }

public string? StudentPhoto { get; set; }

public bool LocationPermissionGranted { get; set; } = false;
public int? LateMinutes { get; set; }

public double? ExitLatitude { get; set; }

public double? ExitLongitude { get; set; }

public double? ReturnLatitude { get; set; }

public double? ReturnLongitude { get; set; }
public bool ExitRecorded { get; set; } = false;

public bool ReturnRecorded { get; set; } = false;
}