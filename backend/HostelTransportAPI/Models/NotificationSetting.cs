namespace HostelTransportAPI.Models;

public class NotificationSetting
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public bool PushNotifications { get; set; }

    public bool NewOutpassRequest { get; set; }

    public bool NewLeaveApplication { get; set; }

    public bool NewUserRegistration { get; set; }
}