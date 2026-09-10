using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HostelTransportAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCollegeNameToLeaveRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CollegeName",
                table: "LeaveRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CollegeName",
                table: "LeaveRequests");
        }
    }
}
