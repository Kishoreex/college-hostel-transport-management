using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HostelTransportAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddApprovalStageNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FinalApprovedBy",
                table: "Outpasses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FirstApprovedBy",
                table: "Outpasses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondApprovedBy",
                table: "Outpasses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FinalApprovedBy",
                table: "LeaveRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FirstApprovedBy",
                table: "LeaveRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondApprovedBy",
                table: "LeaveRequests",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FinalApprovedBy",
                table: "Outpasses");

            migrationBuilder.DropColumn(
                name: "FirstApprovedBy",
                table: "Outpasses");

            migrationBuilder.DropColumn(
                name: "SecondApprovedBy",
                table: "Outpasses");

            migrationBuilder.DropColumn(
                name: "FinalApprovedBy",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "FirstApprovedBy",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "SecondApprovedBy",
                table: "LeaveRequests");
        }
    }
}
