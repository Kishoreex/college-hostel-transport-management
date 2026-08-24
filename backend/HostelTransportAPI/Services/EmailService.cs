using MailKit.Net.Smtp;
using MimeKit;
using MailKit.Security;

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
            new MailboxAddress("Madha Campus", "it@mdch.in"));

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
            SecureSocketOptions.StartTls);

        await smtp.AuthenticateAsync(
            "it@mdch.in",
            "ytbm hyth ntac gsnp");

        await smtp.SendAsync(email);

        await smtp.DisconnectAsync(true);
    }
}