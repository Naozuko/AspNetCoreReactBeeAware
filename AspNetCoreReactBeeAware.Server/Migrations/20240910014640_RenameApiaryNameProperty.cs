using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AspNetCoreReactBeeAware.Server.Migrations
{
    /// <inheritdoc />
    public partial class RenameApiaryNameProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Apiaries",
                newName: "ApiaryName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ApiaryName",
                table: "Apiaries",
                newName: "Name");
        }
    }
}
