using HostelTransportAPI.Data;
using HostelTransportAPI.Hubs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ===============================
// CORS
// ===============================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                  "https://campus.madhapharma.in",
                "https://college-hostel-transport-management.vercel.app",
                "https://college-hostel-transport-management-git-main-kishoreex1.vercel.app",
                "http://202.61.121.102",
                "https://202.61.121.102"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ===============================
// SERVICES
// ===============================
builder.Services.AddControllers();

builder.Services.AddSignalR();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

// ===============================
// DATABASE
// ===============================
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// ===============================
// BUILD APP
// ===============================
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// ===============================
// MIDDLEWARE
// ===============================
app.UseCors("AllowFrontend");

app.UseSwagger();

app.UseSwaggerUI();

app.UseStaticFiles();

// IMPORTANT:
// IIS is already handling HTTPS.
// Do NOT enable UseHttpsRedirection here.

// app.UseHttpsRedirection();

app.MapControllers();

app.MapHub<NotificationHub>("/notificationHub");

app.Run();