namespace HostelTransportAPI.Models;

public class TransportRegistration
{
    public int Id { get; set; }

    public string RegistrationType { get; set; } = "";
    public string CollegeName { get; set; } = "";
    public string Department { get; set; } = "";
    public string Year { get; set; } = "";
    public string Batch { get; set; } = "";
    

    public string StudentName { get; set; } = "";
    public string RegisterNumber { get; set; } = "";

    public string Gender { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";

    public string ParentName { get; set; } = "";
    public string ParentPhone { get; set; } = "";
    public string Address { get; set; } = "";

    public string TokenNumber { get; set; } = "";
    public string Status { get; set; } = "Pending";
public DateTime CreatedAt { get; set; } = DateTime.Now;
    public bool IsApproved { get; set; }

    public string? StudentId { get; set; }

public int RouteId { get; set; }
public int StopId { get; set; }

public TransportRoute? Route { get; set; }
public TransportStop? Stop { get; set; }
}