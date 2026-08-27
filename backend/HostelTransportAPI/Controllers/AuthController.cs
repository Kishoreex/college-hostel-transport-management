using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Data;
using HostelTransportAPI.DTOs;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(
        ApplicationDbContext context,
        IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }


    // =====================================================
    // LOGIN
    // =====================================================

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDto request)
    {
        try
        {
            var user = await _context.Users
                .Include(x => x.Role)
                .Include(x => x.College)
                .FirstOrDefaultAsync(x =>
                    (x.Email == request.UserId ||
                     x.UserId == request.UserId) &&
                    x.IsActive);

            Console.WriteLine("========== LOGIN ==========");
            Console.WriteLine($"UserId    : {request.UserId}");
            Console.WriteLine($"Module    : {request.Module}");
            Console.WriteLine($"DeviceId  : {request.DeviceId}");

            Console.WriteLine(
                user == null
                    ? "User NOT FOUND"
                    : $"User FOUND : {user.UserId}"
            );


            // =====================================================
            // USER VALIDATION
            // =====================================================

            if (user == null)
            {
                return Unauthorized("Invalid User ID or Email");
            }

            if (!user.IsActive)
            {
                return Unauthorized(
                    "Your hostel account has been closed. Please contact the hostel administration."
                );
            }


            // =====================================================
            // PASSWORD VALIDATION
            // =====================================================

            bool validPassword =
                BCrypt.Net.BCrypt.Verify(
                    request.Password,
                    user.PasswordHash
                );

            Console.WriteLine(
                $"Password Valid : {validPassword}"
            );

            if (!validPassword)
            {
                return Unauthorized("Invalid Credentials");
            }


            // =====================================================
            // MODULE VALIDATION
            // =====================================================

            // Student
            if (user.Role?.Name == "Student")
            {
                if (!string.Equals(
                        user.Module,
                        request.Module,
                        StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(
                        $"You can login only to the {user.Module} portal."
                    );
                }
            }


            // Parent
            if (user.Role?.Name == "Parent")
            {
                if (!string.Equals(
                        request.Module,
                        "Hostel",
                        StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(
                        "Parents can login only through Hostel Portal."
                    );
                }
            }


            // Staff roles
            if (
                user.Role?.Name == "System Admin" ||
                user.Role?.Name == "Principal" ||
                user.Role?.Name == "Hostel Incharge" ||
                user.Role?.Name == "Admin Office"
            )
            {
                if (!string.Equals(
                        request.Module,
                        "Admin",
                        StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(
                        "Staff users can login only through Admin Portal."
                    );
                }
            }


            // =====================================================
            // ACTIVE OUTPASS CHECK
            // =====================================================

            bool hasActiveOutpass = false;

            if (user.Role?.Name == "Student")
            {
                hasActiveOutpass = await _context.Outpasses.AnyAsync(x =>
                    x.StudentId == user.UserId &&
                    (
                        x.OutpassState == "Active" ||
                        x.OutpassState == "Outside Hostel"
                    )
                );
            }


            // =====================================================
            // DEVICE LOGIN CHECK
            // =====================================================

            Console.WriteLine(
                $"Database DeviceId : {user.DeviceId}"
            );

            Console.WriteLine(
                $"Request DeviceId  : {request.DeviceId}"
            );


            // First login
            if (string.IsNullOrWhiteSpace(user.DeviceId))
            {
                user.DeviceId = request.DeviceId;

                Console.WriteLine(
                    "First login - saving device."
                );
            }

            // Same device
            else if (user.DeviceId == request.DeviceId)
            {
                Console.WriteLine(
                    "Same device login allowed."
                );
            }

            // Different device
            else
            {
                if (hasActiveOutpass)
                {
                    return BadRequest(
                        "You have an active outpass. Login from another device is not allowed."
                    );
                }

                return BadRequest(
                    "This account is already logged in on another device."
                );
            }


            // =====================================================
            // UPDATE LAST LOGIN
            // =====================================================

            user.LastLogin = DateTime.UtcNow;

            await _context.SaveChangesAsync();


            // =====================================================
            // STUDENT PROFILE
            // =====================================================

            var student = await _context.StudentRegistrations
                .FirstOrDefaultAsync(
                    x => x.StudentId == user.UserId
                );


            // =====================================================
            // CREATE JWT
            // =====================================================

            var token = GenerateJwtToken(user);


            // =====================================================
            // LOGIN RESPONSE
            // =====================================================

            return Ok(new
            {
                token,

                user.Id,
                user.UserId,
                user.FullName,
                user.Email,
                user.PhoneNumber,

                Role = user.Role?.Name,

                user.Module,

                user.StudentId,

                // NEW COLLEGE INFORMATION
                user.CollegeId,

                College = user.College?.Name,

                // KEEPING OLD VALUES TEMPORARILY
                // so existing frontend code does not break.
                user.IsSystemAdmin,
                user.CanManageTransport,
                user.CanManageBoysHostel,
                user.CanManageGirlsHostel,

                ProfilePhoto = student?.ProfilePhoto
            });
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                ex.ToString()
            );
        }
    }


    // =====================================================
    // JWT TOKEN GENERATOR
    // =====================================================

    private string GenerateJwtToken(
        HostelTransportAPI.Models.User user)
    {
        var jwtKey = _configuration["Jwt:Key"];

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            throw new InvalidOperationException(
                "JWT Key is missing from configuration."
            );
        }

        var claims = new List<Claim>
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()
            ),

            new Claim(
                ClaimTypes.Name,
                user.UserId
            ),

            new Claim(
                ClaimTypes.Role,
                user.Role?.Name ?? ""
            )
        };


        // =====================================================
        // COLLEGE CLAIM
        // =====================================================

        // System Admin:
        // no CollegeId = access to all colleges.

        if (user.CollegeId.HasValue)
        {
            claims.Add(
                new Claim(
                    "CollegeId",
                    user.CollegeId.Value.ToString()
                )
            );
        }


        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        );

        var credentials =
            new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );


        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials
        );


        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }


    // =====================================================
    // LOGOUT
    // =====================================================

    [HttpPost("logout/{userId}")]
    public async Task<IActionResult> Logout(
        string userId)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(
                x => x.UserId == userId
            );

        if (user == null)
        {
            return NotFound();
        }

        user.DeviceId = null;

        await _context.SaveChangesAsync();

        return Ok();
    }


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(
        ChangePasswordRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(
                x => x.UserId == request.UserId
            );


        if (user != null && !user.IsActive)
        {
            return Unauthorized(new
            {
                message =
                    "Your hostel account has been closed. Please contact the hostel administration."
            });
        }


        if (user == null)
        {
            return NotFound("User not found");
        }


        bool valid =
            BCrypt.Net.BCrypt.Verify(
                request.CurrentPassword,
                user.PasswordHash
            );


        if (!valid)
        {
            return BadRequest(
                "Current password is incorrect"
            );
        }


        user.PasswordHash =
            BCrypt.Net.BCrypt.HashPassword(
                request.NewPassword
            );


        await _context.SaveChangesAsync();


        return Ok(
            "Password updated successfully"
        );
    }
}