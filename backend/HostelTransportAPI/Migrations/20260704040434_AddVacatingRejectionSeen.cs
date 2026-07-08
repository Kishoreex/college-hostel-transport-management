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
}

        /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.DropColumn(
        name: "RejectionSeen",
        table: "VacatingRequests");
}
    }
}
