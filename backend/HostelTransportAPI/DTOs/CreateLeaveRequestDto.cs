public class CreateLeaveRequestDto
{
    public string StudentId { get; set; } = "";

    public string StudentName { get; set; } = "";

    public string LeaveType { get; set; } = "";

    public string Campus { get; set; } = "";

    public string Department { get; set; } = "";

    public string Gender { get; set; } = "";

    public string Year { get; set; } = "";

    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public string Reason { get; set; } = "";

    public string Destination { get; set; } = "";

    // NEW

    public string ExitTime { get; set; } = "";

    public string ReturnTime { get; set; } = "";
}