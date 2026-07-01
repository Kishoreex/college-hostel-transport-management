using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HostelTransportAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTransportCancellationDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Batch",
                table: "TransportCancellations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BusNumber",
                table: "TransportCancellations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BusRoute",
                table: "TransportCancellations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CollegeName",
                table: "TransportCancellations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "TransportCancellations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "TransportCancellations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PickupPoint",
                table: "TransportCancellations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Year",
                table: "TransportCancellations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Batch",
                table: "TransportCancellations");

            migrationBuilder.DropColumn(
                name: "BusNumber",
                table: "TransportCancellations");

            migrationBuilder.DropColumn(
                name: "BusRoute",
                table: "TransportCancellations");

            migrationBuilder.DropColumn(
                name: "CollegeName",
                table: "TransportCancellations");

            migrationBuilder.DropColumn(
                name: "Department",
                table: "TransportCancellations");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "TransportCancellations");

            migrationBuilder.DropColumn(
                name: "PickupPoint",
                table: "TransportCancellations");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "TransportCancellations");
        }
    }
}
