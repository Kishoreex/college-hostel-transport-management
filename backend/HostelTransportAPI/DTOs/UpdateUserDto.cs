public class UpdateUserDto
{
    public string FullName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }

    public string? NewPassword { get; set; }

    public bool IsSystemAdmin { get; set; }
    public bool CanManageTransport { get; set; }
    public bool CanManageBoysHostel { get; set; }
    public bool CanManageGirlsHostel { get; set; }
}