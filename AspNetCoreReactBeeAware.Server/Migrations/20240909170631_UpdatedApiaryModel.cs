using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AspNetCoreReactBeeAware.Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedApiaryModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ApiaryName",
                table: "Apiaries",
                newName: "Name");

            migrationBuilder.AddColumn<int>(
                name: "ApiaryId1",
                table: "Hives",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Apiaries",
                type: "TEXT",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactInfo",
                table: "Apiaries",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Apiaries",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Apiaries",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Hives_ApiaryId1",
                table: "Hives",
                column: "ApiaryId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Hives_Apiaries_ApiaryId1",
                table: "Hives",
                column: "ApiaryId1",
                principalTable: "Apiaries",
                principalColumn: "ApiaryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Hives_Apiaries_ApiaryId1",
                table: "Hives");

            migrationBuilder.DropIndex(
                name: "IX_Hives_ApiaryId1",
                table: "Hives");

            migrationBuilder.DropColumn(
                name: "ApiaryId1",
                table: "Hives");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Apiaries");

            migrationBuilder.DropColumn(
                name: "ContactInfo",
                table: "Apiaries");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Apiaries");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Apiaries");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Apiaries",
                newName: "ApiaryName");
        }
    }
}
