using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNoteLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NoteLinks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    NoteAId = table.Column<Guid>(type: "TEXT", nullable: false),
                    NoteBId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteLinks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NoteLinks_Notes_NoteAId",
                        column: x => x.NoteAId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NoteLinks_Notes_NoteBId",
                        column: x => x.NoteBId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NoteLinks_NoteAId_NoteBId",
                table: "NoteLinks",
                columns: new[] { "NoteAId", "NoteBId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NoteLinks_NoteBId",
                table: "NoteLinks",
                column: "NoteBId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NoteLinks");
        }
    }
}
