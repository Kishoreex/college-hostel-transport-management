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

    return Ok(route);
}

[HttpGet]
public async Task<IActionResult> GetRoutes()
{
    var routes = await _context.TransportRoutes
        .Include(x => x.Stops)
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

    if(route == null)
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

    return Ok();
}