using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HostelTransportAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddApprovalStage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApprovalStage",
                table: "Outpasses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ApprovalStage",
                table: "LeaveRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovalStage",
                table: "Outpasses");

            migrationBuilder.DropColumn(
                name: "ApprovalStage",
                table: "LeaveRequests");
        }
    }
}
