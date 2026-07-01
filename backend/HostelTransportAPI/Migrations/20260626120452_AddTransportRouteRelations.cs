using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HostelTransportAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTransportRouteRelations : Migration
    {
        /// <inheritdoc />
      protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.CreateIndex(
        name: "IX_TransportRegistrations_RouteId",
        table: "TransportRegistrations",
        column: "RouteId");

    migrationBuilder.CreateIndex(
        name: "IX_TransportRegistrations_StopId",
        table: "TransportRegistrations",
        column: "StopId");

    migrationBuilder.AddForeignKey(
        name: "FK_TransportRegistrations_TransportRoutes_RouteId",
        table: "TransportRegistrations",
        column: "RouteId",
        principalTable: "TransportRoutes",
        principalColumn: "Id",
        onDelete: ReferentialAction.Restrict);

    migrationBuilder.AddForeignKey(
        name: "FK_TransportRegistrations_TransportStops_StopId",
        table: "TransportRegistrations",
        column: "StopId",
        principalTable: "TransportStops",
        principalColumn: "Id",
        onDelete: ReferentialAction.Restrict);
}

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.DropForeignKey(
        name: "FK_TransportRegistrations_TransportRoutes_RouteId",
        table: "TransportRegistrations");

    migrationBuilder.DropForeignKey(
        name: "FK_TransportRegistrations_TransportStops_StopId",
        table: "TransportRegistrations");

    migrationBuilder.DropIndex(
        name: "IX_TransportRegistrations_RouteId",
        table: "TransportRegistrations");

    migrationBuilder.DropIndex(
        name: "IX_TransportRegistrations_StopId",
        table: "TransportRegistrations");
}
    }
}
