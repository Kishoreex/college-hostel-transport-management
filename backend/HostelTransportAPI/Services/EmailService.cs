using MailKit.Net.Smtp;
using MimeKit;

namespace HostelTransportAPI.Services;

public class EmailService
{
    public async Task SendEmailAsync(
        string toEmail,
        string subject,
        string body)
    {
        var email = new MimeMessage();

        email.From.Add(
            MailboxAddress.Parse("it@mdch.in"));

        email.To.Add(
            MailboxAddress.Parse(toEmail));

        email.Subject = subject;

        email.Body = new TextPart("plain")
        {
            Text = body
        };

        using var smtp = new SmtpClient();

        await smtp.ConnectAsync(
            "smtp.mdch.in",
            587,
            MailKit.Security.SecureSocketOptions.StartTls);

        await smtp.AuthenticateAsync(
            "it@mdch.in",
            "pwti bszs iour cvek");

        await smtp.SendAsync(email);

        await smtp.DisconnectAsync(true);
    }
}