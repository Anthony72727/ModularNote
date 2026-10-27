using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace ModularNoteUnitTest.Infrastructure
{
    public class ModularNoteDbContextTests : IDisposable
    {
        private readonly SqliteInMemoryDatabase _database = new();

        public void Dispose()
        {
            _database.Dispose();
        }

        [Fact]
        public void Model_NoteHasIdAsPrimaryKey()
        {
            using var dbContext = _database.CreateDbContext();
            IEntityType entity = dbContext.Model.FindEntityType(typeof(Note))!;

            var key = entity.FindPrimaryKey()!;

            Assert.Equal(nameof(Note.Id), Assert.Single(key.Properties).Name);
        }

        [Fact]
        public void Model_TitleIsRequiredWithDomainMaxLength()
        {
            using var dbContext = _database.CreateDbContext();
            IProperty title = dbContext.Model.FindEntityType(typeof(Note))!.FindProperty(nameof(Note.Title))!;

            Assert.False(title.IsNullable);
            Assert.Equal(Note.TitleMaxLength, title.GetMaxLength());
        }

        [Fact]
        public void Model_DescriptionIsOptionalWithDomainMaxLength()
        {
            using var dbContext = _database.CreateDbContext();
            IProperty description = dbContext.Model.FindEntityType(typeof(Note))!.FindProperty(nameof(Note.Description))!;

            Assert.True(description.IsNullable);
            Assert.Equal(Note.DescriptionMaxLength, description.GetMaxLength());
        }

        [Fact]
        public void Migrations_AreUpToDateWithTheModel()
        {
            using var dbContext = _database.CreateDbContext();

            Assert.False(dbContext.Database.HasPendingModelChanges());
            Assert.Empty(dbContext.Database.GetPendingMigrations());
        }

        [Fact]
        public async Task CreatedAt_IsReadBackAsUtc()
        {
            var note = Note.Create("Idée", null);
            await SaveAsync(note);

            using var dbContext = _database.CreateDbContext();
            var saved = await dbContext.Notes.SingleAsync();

            Assert.Equal(DateTimeKind.Utc, saved.CreatedAt.Kind);
            Assert.Equal(note.CreatedAt, saved.CreatedAt);
        }

        [Fact]
        public async Task UpdatedAt_IsReadBackAsUtc()
        {
            var note = Note.Create("Idée", null);
            note.Update("Idée modifiée", null);
            await SaveAsync(note);

            using var dbContext = _database.CreateDbContext();
            var saved = await dbContext.Notes.SingleAsync();

            Assert.NotNull(saved.UpdatedAt);
            Assert.Equal(DateTimeKind.Utc, saved.UpdatedAt.Value.Kind);
            Assert.Equal(note.UpdatedAt, saved.UpdatedAt);
        }

        [Fact]
        public async Task UpdatedAt_NeverModified_IsReadBackAsNull()
        {
            await SaveAsync(Note.Create("Idée", null));

            using var dbContext = _database.CreateDbContext();
            var saved = await dbContext.Notes.SingleAsync();

            Assert.Null(saved.UpdatedAt);
        }

        [Fact]
        public async Task SaveChanges_TwoNotesWithSameId_Throws()
        {
            var note = Note.Create("Idée", null);
            await SaveAsync(note);

            using var dbContext = _database.CreateDbContext();
            dbContext.Notes.Add(note);

            await Assert.ThrowsAsync<DbUpdateException>(() => dbContext.SaveChangesAsync());
        }

        private async Task SaveAsync(Note note)
        {
            using var dbContext = _database.CreateDbContext();
            dbContext.Notes.Add(note);
            await dbContext.SaveChangesAsync();
        }
    }
}
