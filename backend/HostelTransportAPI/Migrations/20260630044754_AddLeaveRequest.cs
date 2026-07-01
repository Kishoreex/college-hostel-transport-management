using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HostelTransportAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddLeaveRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CampusStatus",
                table: "LeaveRequests",
                newName: "Year");

            migrationBuilder.RenameColumn(
                name: "AppliedDate",
                table: "LeaveRequests",
                newName: "CreatedDate");

            migrationBuilder.AddColumn<string>(
                name: "Campus",
                table: "LeaveRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "LeaveRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "LeaveRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LeaveNumber",
                table: "LeaveRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RejectReason",
                table: "LeaveRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StudentName",
                table: "LeaveRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Campus",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "Department",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "LeaveNumber",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "RejectReason",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "StudentName",
                table: "LeaveRequests");

            migrationBuilder.RenameColumn(
                name: "Year",
                table: "LeaveRequests",
                newName: "CampusStatus");

            migrationBuilder.RenameColumn(
                name: "CreatedDate",
                table: "LeaveRequests",
                newName: "AppliedDate");
        }
    }
}
