namespace HostelTransportAPI.DTOs;

public class CreateTransportRegistrationDto
{
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

    public string BusRoute { get; set; } = "";
    public string BusStop { get; set; } = "";

}