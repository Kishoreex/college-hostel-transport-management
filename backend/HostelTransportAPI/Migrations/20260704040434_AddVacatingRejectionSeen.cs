using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HostelTransportAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddVacatingRejectionSeen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "RejectionSeen",
                table: "VacatingRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ExitTime",
                table: "LeaveRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReturnTime",
                table: "LeaveRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RejectionSeen",
                table: "VacatingRequests");

            migrationBuilder.DropColumn(
                name: "ExitTime",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "ReturnTime",
                table: "LeaveRequests");
        }
    }
}
