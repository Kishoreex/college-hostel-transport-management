using Microsoft.AspNetCore.SignalR;

namespace HostelTransportAPI.Hubs
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId =
                Context.GetHttpContext()?.Request.Query["userId"];

            if (!string.IsNullOrWhiteSpace(userId))
            {
                await Groups.AddToGroupAsync(
                    Context.ConnectionId,
                    userId!
                );
            }

            await base.OnConnectedAsync();
        }
    }
}