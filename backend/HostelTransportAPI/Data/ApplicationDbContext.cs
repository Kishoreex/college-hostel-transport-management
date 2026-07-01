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
    new Role { Id = 1, Name = "Admin" },
    new Role { Id = 2, Name = "Student" }
);
    }
}