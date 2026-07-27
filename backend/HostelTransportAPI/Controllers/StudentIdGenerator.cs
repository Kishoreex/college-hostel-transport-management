using HostelTransportAPI.Data;

namespace HostelTransportAPI.Services;

public static class StudentIdGenerator
{
    public static string GenerateStudentId(
        ApplicationDbContext context,
        string collegeName)
    {
        string prefix = collegeName switch
        {
            "Madha Dental College & Hospital" => "MDC",
            "Madha College of Nursing" => "MCN",
            "Madha College of Physiotherapy" => "MCP",
            _ => "STD"
        };

        var ids = context.Users
            .Where(x => x.UserId.StartsWith(prefix))
            .Select(x => x.UserId)
            .ToList();

        int next = 1;

        if (ids.Any())
        {
            next = ids
                .Select(x =>
                {
                    int number;

                    return int.TryParse(
                        x.Substring(prefix.Length),
                        out number
                    )
                    ? number
                    : 0;
                })
                .Max() + 1;
        }

        return $"{prefix}{next:D4}";
    }
}