namespace HostelTransportAPI.Models;

public class StudentRegistration
{
    public int Id { get; set; }

    public string RegistrationType { get; set; } = string.Empty;

    // College Info
    public string CollegeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    public string Batch { get; set; } = string.Empty;
    

    // Student Info
    public string StudentName { get; set; } = string.Empty;
    public string RegisterNumber { get; set; } = string.Empty;

    public string Gender { get; set; } = "";
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;

    // Parent Info
    public string ParentName { get; set; } = string.Empty;
    public string ParentPhone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    // Approval Info
    public string TokenNumber { get; set; } = string.Empty;
    public string? StudentId { get; set; }

    public bool IsApproved { get; set; } = false;

    public string Status { get; set; } = "Pending";
    public DateTime? ApprovedDate { get; set; }

public DateTime? RejectedDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ProfilePhoto { get; set; }

public DateTime? LastProfileUpdate { get; set; }
}