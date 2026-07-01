using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Data;
using HostelTransportAPI.DTOs;
using HostelTransportAPI.Models;

namespace HostelTransportAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransportRoutesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TransportRoutesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateRoute(
        CreateRouteDto dto)
    {
        var route = new TransportRoute
        {
            RouteName = dto.RouteName,
            BusNumber = dto.BusNumber,
            DriverName = dto.DriverName,
            DriverPhone = dto.DriverPhone,
            MorningTime = dto.MorningTime,
            EveningTime = dto.EveningTime,
            Stops = dto.Stops.Select(x =>
                new TransportStop
                {
                    StopName = x.StopName,
                    PickupTime = x.PickupTime
                }).ToList()
        };

        _context.TransportRoutes.Add(route);

    await _context.SaveChangesAsync();

return Ok(new
{
    id = route.Id,
    routeName = route.RouteName,
    busNumber = route.BusNumber,
    driverName = route.DriverName,
    driverPhone = route.DriverPhone,
    morningTime = route.MorningTime,
    eveningTime = route.EveningTime
});
    }

    [HttpGet]
    public async Task<IActionResult> GetRoutes()
    {
        var routes = await _context.TransportRoutes
    .Include(r => r.Stops)
    .Select(r => new
    {
        id = r.Id,
        routeName = r.RouteName,
        busNumber = r.BusNumber,
        driverName = r.DriverName,
        driverPhone = r.DriverPhone,
        morningTime = r.MorningTime,
        eveningTime = r.EveningTime,

        stops = r.Stops.Select(s => new
        {
            id = s.Id,
            stopName = s.StopName,
            pickupTime = s.PickupTime
        }).ToList()
    })
    .ToListAsync();

return Ok(routes);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRoute(
        int id,
        CreateRouteDto dto)
    {
        var route = await _context.TransportRoutes
            .Include(x => x.Stops)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (route == null)
            return NotFound();

        route.RouteName = dto.RouteName;
        route.BusNumber = dto.BusNumber;
        route.DriverName = dto.DriverName;
        route.DriverPhone = dto.DriverPhone;
        route.MorningTime = dto.MorningTime;
        route.EveningTime = dto.EveningTime;

        _context.TransportStops.RemoveRange(route.Stops);

        route.Stops = dto.Stops.Select(x =>
            new TransportStop
            {
                StopName = x.StopName,
                PickupTime = x.PickupTime
            }).ToList();

       await _context.SaveChangesAsync();

return Ok(new
{
    message = "Route updated successfully"
});
    }
}