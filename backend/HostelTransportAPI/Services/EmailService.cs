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
            MailboxAddress.Parse("kishore1kumar4@gmail.com"));

        email.To.Add(
            MailboxAddress.Parse(toEmail));

        email.Subject = subject;

        email.Body = new TextPart("plain")
        {
            Text = body
        };

        using var smtp = new SmtpClient();

        await smtp.ConnectAsync(
            "smtp.gmail.com",
            587,
            MailKit.Security.SecureSocketOptions.StartTls);

        await smtp.AuthenticateAsync(
            "kishore1kumar4@gmail.com",
            "tbmd jdlp jefo qoyo");

        await smtp.SendAsync(email);

        await smtp.DisconnectAsync(true);
    }
}