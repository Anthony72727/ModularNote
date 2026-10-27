using Domain.Entities;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ModularNoteUnitTest.Infrastructure
{
    public class EfNoteRepositoryTests : IDisposable
    {
        private readonly SqliteInMemoryDatabase _database = new();

        public void Dispose()
        {
            _database.Dispose();
        }

        [Fact]
        public async Task AddAsync_SavesTheNoteInTheDatabase()
        {
            var note = Note.Create("Idée", "Description");

            using (var dbContext = _database.CreateDbContext())
            {
                await new EfNoteRepository(dbContext).AddAsync(note);
            }

            using var readContext = _database.CreateDbContext();
            var saved = await readContext.Notes.SingleAsync();
            Assert.Equal(note.Id, saved.Id);
            Assert.Equal("Idée", saved.Title);
            Assert.Equal("Description", saved.Description);
            Assert.Equal(note.CreatedAt, saved.CreatedAt);
            Assert.Null(saved.UpdatedAt);
        }

        [Fact]
        public async Task AddAsync_WithoutDescription_SavesNullDescription()
        {
            var note = Note.Create("Idée", null);

            using (var dbContext = _database.CreateDbContext())
            {
                await new EfNoteRepository(dbContext).AddAsync(note);
            }

            using var readContext = _database.CreateDbContext();
            var saved = await readContext.Notes.SingleAsync();
            Assert.Null(saved.Description);
        }

        [Fact]
        public async Task AddAsync_WithCancelledToken_DoesNotSaveTheNote()
        {
            using var cancellation = new CancellationTokenSource();
            cancellation.Cancel();

            using (var dbContext = _database.CreateDbContext())
            {
                await Assert.ThrowsAnyAsync<OperationCanceledException>(
                    () => new EfNoteRepository(dbContext).AddAsync(Note.Create("Idée", null), cancellation.Token));
            }

            using var readContext = _database.CreateDbContext();
            Assert.Equal(0, await readContext.Notes.CountAsync());
        }

        [Fact]
        public async Task GetAllAsync_WithoutNotes_ReturnsEmptyList()
        {
            using var dbContext = _database.CreateDbContext();

            var notes = await new EfNoteRepository(dbContext).GetAllAsync();

            Assert.Empty(notes);
        }

        [Fact]
        public async Task GetAllAsync_ReturnsNotesOrderedByCreationDate()
        {
            var first = Note.Create("Première", null);
            await Task.Delay(10);
            var second = Note.Create("Seconde", null);
            await Task.Delay(10);
            var third = Note.Create("Troisième", null);

            using (var dbContext = _database.CreateDbContext())
            {
                // Inserted out of order on purpose
                dbContext.Notes.AddRange(third, first, second);
                await dbContext.SaveChangesAsync();
            }

            using var readContext = _database.CreateDbContext();
            var notes = await new EfNoteRepository(readContext).GetAllAsync();

            Assert.Equal(new[] { first.Id, second.Id, third.Id }, notes.Select(note => note.Id));
        }

        [Fact]
        public async Task GetAllAsync_DoesNotTrackTheNotes()
        {
            await SeedAsync(Note.Create("Idée", null));
            using var dbContext = _database.CreateDbContext();

            await new EfNoteRepository(dbContext).GetAllAsync();

            Assert.Empty(dbContext.ChangeTracker.Entries());
        }

        [Fact]
        public async Task GetByIdAsync_ExistingNote_ReturnsTheNote()
        {
            var note = Note.Create("Idée", "Description");
            await SeedAsync(Note.Create("Autre", null), note);
            using var dbContext = _database.CreateDbContext();

            var found = await new EfNoteRepository(dbContext).GetByIdAsync(note.Id);

            Assert.NotNull(found);
            Assert.Equal(note.Id, found.Id);
            Assert.Equal("Idée", found.Title);
            Assert.Equal("Description", found.Description);
        }

        [Fact]
        public async Task GetByIdAsync_UnknownId_ReturnsNull()
        {
            await SeedAsync(Note.Create("Idée", null));
            using var dbContext = _database.CreateDbContext();

            var found = await new EfNoteRepository(dbContext).GetByIdAsync(Guid.NewGuid());

            Assert.Null(found);
        }

        [Fact]
        public async Task GetByIdAsync_DoesNotTrackTheNote()
        {
            var note = Note.Create("Idée", null);
            await SeedAsync(note);
            using var dbContext = _database.CreateDbContext();

            await new EfNoteRepository(dbContext).GetByIdAsync(note.Id);

            Assert.Empty(dbContext.ChangeTracker.Entries());
        }

        private async Task SeedAsync(params Note[] notes)
        {
            using var dbContext = _database.CreateDbContext();
            dbContext.Notes.AddRange(notes);
            await dbContext.SaveChangesAsync();
        }
    }
}
