using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HostelTransportAPI.Migrations
{
    public partial class AddParentLoginCredentials : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ParentLoginId",
                table: "StudentRegistrations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentTemporaryPassword",
                table: "StudentRegistrations",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParentLoginId",
                table: "StudentRegistrations");

            migrationBuilder.DropColumn(
                name: "ParentTemporaryPassword",
                table: "StudentRegistrations");
        }
    }
}