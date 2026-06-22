namespace HostelTransportAPI.DTOs;

public class LoginRequestDto
{
    public string UserId { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string Module { get; set; } = string.Empty;
}