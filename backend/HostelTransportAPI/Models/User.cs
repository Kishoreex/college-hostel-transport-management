namespace HostelTransportAPI.Models;

public class User
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = "";

    public string PasswordHash { get; set; } = string.Empty;


    // =========================
    // ROLE
    // =========================

    public int RoleId { get; set; }

    public Role? Role { get; set; }


    // =========================
    // COLLEGE
    // =========================

    // NULL = System Admin / All Colleges
    // Otherwise user belongs to one college
    public int? CollegeId { get; set; }

    public College? College { get; set; }


    // =========================
    // EXISTING USER DATA
    // =========================

    public string Module { get; set; } = string.Empty;

    public string? StudentId { get; set; }


    // =========================
    // OLD PERMISSIONS
    // =========================
    // We are keeping these temporarily
    // so existing code does not break.
    // We will remove them later.

    public bool IsSystemAdmin { get; set; }

    public bool CanManageTransport { get; set; }

    public bool CanManageBoysHostel { get; set; }

    public bool CanManageGirlsHostel { get; set; }


    // =========================
    // ACCOUNT STATUS
    // =========================

    public bool IsActive { get; set; } = true;

    public string? DeviceId { get; set; }

    public string? ProfilePhoto { get; set; }

    public DateTime? LastLogin { get; set; }

    public DateTime? LastProfileUpdate { get; set; }
}