using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceRideBookingWithTrip : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RideBookings_Drivers_DriverSsn",
                table: "RideBookings");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "RideBookings",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Pending");

            migrationBuilder.CreateTable(
                name: "Trips",
                columns: table => new
                {
                    TripId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DriverSsn = table.Column<int>(type: "int", nullable: false),
                    EstimatedTimeOfArrival = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Destination = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PickupArea = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trips", x => x.TripId);
                    table.ForeignKey(
                        name: "FK_Trips_Drivers_DriverSsn",
                        column: x => x.DriverSsn,
                        principalTable: "Drivers",
                        principalColumn: "DriverSsn",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TripStudents",
                columns: table => new
                {
                    TripId = table.Column<int>(type: "int", nullable: false),
                    StudentSsn = table.Column<int>(type: "int", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TripStudents", x => new { x.TripId, x.StudentSsn });
                    table.ForeignKey(
                        name: "FK_TripStudents_Students_StudentSsn",
                        column: x => x.StudentSsn,
                        principalTable: "Students",
                        principalColumn: "StudentSsn",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TripStudents_Trips_TripId",
                        column: x => x.TripId,
                        principalTable: "Trips",
                        principalColumn: "TripId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Trips_DriverSsn",
                table: "Trips",
                column: "DriverSsn");

            migrationBuilder.CreateIndex(
                name: "IX_TripStudents_StudentSsn",
                table: "TripStudents",
                column: "StudentSsn");

            migrationBuilder.AddForeignKey(
                name: "FK_RideBookings_Drivers_DriverSsn",
                table: "RideBookings",
                column: "DriverSsn",
                principalTable: "Drivers",
                principalColumn: "DriverSsn",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RideBookings_Drivers_DriverSsn",
                table: "RideBookings");

            migrationBuilder.DropTable(
                name: "TripStudents");

            migrationBuilder.DropTable(
                name: "Trips");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "RideBookings",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Pending",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AddForeignKey(
                name: "FK_RideBookings_Drivers_DriverSsn",
                table: "RideBookings",
                column: "DriverSsn",
                principalTable: "Drivers",
                principalColumn: "DriverSsn",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
