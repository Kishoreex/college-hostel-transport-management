namespace HostelTransportAPI.Models;

public class User
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = "";

    public string PasswordHash { get; set; } = string.Empty;

    public int RoleId { get; set; }

    public Role? Role { get; set; }

    public string Module { get; set; } = string.Empty;

    // NEW PERMISSIONS

    public bool IsSystemAdmin { get; set; }

    public bool CanManageTransport { get; set; }

    public bool CanManageBoysHostel { get; set; }

    public bool CanManageGirlsHostel { get; set; }

    public bool IsActive { get; set; } = true;
    public string? DeviceId { get; set; }

public string? ProfilePhoto { get; set; }

public DateTime? LastLogin { get; set; }


public DateTime? LastProfileUpdate { get; set; }
}