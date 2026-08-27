using Microsoft.EntityFrameworkCore;
using HostelTransportAPI.Models;

namespace HostelTransportAPI.Data;

public class ApplicationDbContext : DbContext
{
    
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<College> Colleges => Set<College>();
    public DbSet<ActivityLog> ActivityLogs { get; set; }
    public DbSet<StudentRegistration> StudentRegistrations => Set<StudentRegistration>();
    public DbSet<TransportRegistration> TransportRegistrations { get; set; }
    public DbSet<TransportRoute> TransportRoutes { get; set; }

public DbSet<TransportStop> TransportStops { get; set; }
public DbSet<TransportCancellation> TransportCancellations => Set<TransportCancellation>();
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<NotificationSetting> NotificationSettings { get; set; }
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<Outpass> Outpasses => Set<Outpass>();
    public DbSet<VacatingRequest> VacatingRequests => Set<VacatingRequest>();
    public DbSet<HostelRoomAllocation> HostelRoomAllocations => Set<HostelRoomAllocation>();
    public DbSet<HostelRoom> HostelRooms => Set<HostelRoom>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // =========================
// USER → COLLEGE
// =========================

modelBuilder.Entity<User>()
    .HasOne(x => x.College)
    .WithMany(x => x.Users)
    .HasForeignKey(x => x.CollegeId)
    .OnDelete(DeleteBehavior.Restrict);

modelBuilder.Entity<TransportRegistration>()
    .HasOne(x => x.Route)
    .WithMany()
    .HasForeignKey(x => x.RouteId)
    .OnDelete(DeleteBehavior.Restrict);

modelBuilder.Entity<TransportRegistration>()
    .HasOne(x => x.Stop)
    .WithMany()
    .HasForeignKey(x => x.StopId)
    .OnDelete(DeleteBehavior.Restrict);
modelBuilder.Entity<Role>().HasData(
    new Role { Id = 1, Name = "System Admin" },
    new Role { Id = 2, Name = "Student" },
    new Role { Id = 3, Name = "Principal" },
    new Role { Id = 4, Name = "Hostel Incharge" },
    new Role { Id = 5, Name = "Admin Office" }
);
modelBuilder.Entity<College>().HasData(
    new College
    {
        Id = 1,
        Name = "Madha Dental College & Hospital",
        Code = "MDCH",
        IsActive = true
    },
    new College
    {
        Id = 2,
        Name = "Madha College of Physiotherapy",
        Code = "MCOP",
        IsActive = true
    },
    new College
    {
        Id = 3,
        Name = "Madha College of Nursing",
        Code = "MCON",
        IsActive = true
    }
);
    }
}