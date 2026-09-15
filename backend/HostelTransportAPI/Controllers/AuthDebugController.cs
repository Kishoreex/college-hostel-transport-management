using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/auth-debug")]
public class AuthDebugController : ControllerBase
{
    [HttpGet]
    public IActionResult Debug()
    {
        return Ok(new
        {
            IsAuthenticated = User.Identity?.IsAuthenticated,

            Name = User.Identity?.Name,

            NameIdentifier =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value,

            Role =
                User.FindFirst(ClaimTypes.Role)?.Value,

            UserId =
                User.FindFirst("userId")?.Value,

            Claims = User.Claims.Select(c => new
            {
                c.Type,
                c.Value
            })
        });
    }
}