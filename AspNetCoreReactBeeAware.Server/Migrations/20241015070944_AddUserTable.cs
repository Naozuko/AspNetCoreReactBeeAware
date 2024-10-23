using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AspNetCoreReactBeeAware.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddUserTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Username = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    PasswordHash = table.Column<byte[]>(type: "BLOB", nullable: false),
                    PasswordSalt = table.Column<byte[]>(type: "BLOB", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.AddColumn<int>(
                name: "ApiaryId1",
                table: "Hives",
                type: "INTEGER",
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
    }
}
