using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HostelTransportAPI.Migrations
{
    public partial class AddOutpassRejectReason : Migration
    {
   protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AddColumn<string>(
        name: "RejectReason",
        table: "Outpasses",
        type: "nvarchar(max)",
        nullable: true);
}

     protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.DropColumn(
        name: "RejectReason",
        table: "Outpasses");
}
    }
}