using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HostelTransportAPI.Migrations
{
    /// <inheritdoc />
    public partial class OutpassTrackingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EarlyExitMinutes",
                table: "Outpasses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ExitRecorded",
                table: "Outpasses",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "LocationPermissionGranted",
                table: "Outpasses",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ReturnRecorded",
                table: "Outpasses",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "StudentPhoto",
                table: "Outpasses",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EarlyExitMinutes",
                table: "Outpasses");

            migrationBuilder.DropColumn(
                name: "ExitRecorded",
                table: "Outpasses");

            migrationBuilder.DropColumn(
                name: "LocationPermissionGranted",
                table: "Outpasses");

            migrationBuilder.DropColumn(
                name: "ReturnRecorded",
                table: "Outpasses");

            migrationBuilder.DropColumn(
                name: "StudentPhoto",
                table: "Outpasses");
        }
    }
}
