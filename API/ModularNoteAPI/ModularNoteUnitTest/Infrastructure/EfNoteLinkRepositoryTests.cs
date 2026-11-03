using Domain.Entities;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ModularNoteUnitTest.Infrastructure
{
    public class EfNoteLinkRepositoryTests : IDisposable
    {
        private readonly SqliteInMemoryDatabase _database = new();

        public void Dispose()
        {
            _database.Dispose();
        }

        [Fact]
        public async Task GetLinkedNotesAsync_ReturnsTheNotesOnBothSidesOfTheLinks_OldestFirst()
        {
            var note = Note.Create("Idée", null);
            await Task.Delay(10);
            var older = Note.Create("Plus ancienne", null);
            await Task.Delay(10);
            var newer = Note.Create("Plus récente", null);
            var unrelated = Note.Create("Sans lien", null);
            await SeedAsync(note, older, newer, unrelated);
            using (var dbContext = _database.CreateDbContext())
            {
                // Created in both directions, and out of order on purpose
                await new EfNoteLinkRepository(dbContext).AddRangeAsync(new[] { NoteLink.Create(newer.Id, note.Id), NoteLink.Create(note.Id, older.Id) });
            }

            using var readContext = _database.CreateDbContext();
            var linked = await new EfNoteLinkRepository(readContext).GetLinkedNotesAsync(note.Id);

            Assert.Equal(new[] { older.Id, newer.Id }, linked.Select(n => n.Id));
        }

        [Fact]
        public async Task GetLinkedNotesAsync_IsVisibleFromBothNotes()
        {
            var first = Note.Create("Première", null);
            var second = Note.Create("Seconde", null);
            await SeedAsync(first, second);
            using var dbContext = _database.CreateDbContext();
            var repository = new EfNoteLinkRepository(dbContext);

            await repository.AddRangeAsync(new[] { NoteLink.Create(first.Id, second.Id) });

            Assert.Equal(second.Id, Assert.Single(await repository.GetLinkedNotesAsync(first.Id)).Id);
            Assert.Equal(first.Id, Assert.Single(await repository.GetLinkedNotesAsync(second.Id)).Id);
        }

        [Fact]
        public async Task GetLinkedNotesAsync_DoesNotTrackTheNotes()
        {
            var first = Note.Create("Première", null);
            var second = Note.Create("Seconde", null);
            await SeedAsync(first, second);
            using (var dbContext = _database.CreateDbContext())
            {
                await new EfNoteLinkRepository(dbContext).AddRangeAsync(new[] { NoteLink.Create(first.Id, second.Id) });
            }

            using var readContext = _database.CreateDbContext();
            await new EfNoteLinkRepository(readContext).GetLinkedNotesAsync(first.Id);

            Assert.Empty(readContext.ChangeTracker.Entries());
        }

        [Fact]
        public async Task AddRangeAsync_SameLinkInTheOtherDirection_IsRefusedByTheDatabase()
        {
            var first = Note.Create("Première", null);
            var second = Note.Create("Seconde", null);
            await SeedAsync(first, second);
            using (var dbContext = _database.CreateDbContext())
            {
                await new EfNoteLinkRepository(dbContext).AddRangeAsync(new[] { NoteLink.Create(first.Id, second.Id) });
            }

            using var otherContext = _database.CreateDbContext();
            await Assert.ThrowsAsync<DbUpdateException>(
                () => new EfNoteLinkRepository(otherContext).AddRangeAsync(new[] { NoteLink.Create(second.Id, first.Id) }));
        }

        [Fact]
        public async Task AddRangeAsync_WithUnknownNote_IsRefusedByTheDatabase()
        {
            var note = Note.Create("Idée", null);
            await SeedAsync(note);
            using var dbContext = _database.CreateDbContext();

            await Assert.ThrowsAsync<DbUpdateException>(
                () => new EfNoteLinkRepository(dbContext).AddRangeAsync(new[] { NoteLink.Create(note.Id, Guid.NewGuid()) }));
        }

        [Theory]
        [InlineData(true)]
        [InlineData(false)]
        public async Task DeleteAsync_OfANote_DeletesItsLinksWhicheverSideItIsOn(bool deleteTheSmallestId)
        {
            var first = Note.Create("Première", null);
            var second = Note.Create("Seconde", null);
            var other = Note.Create("Autre", null);
            await SeedAsync(first, second, other);
            var link = NoteLink.Create(first.Id, second.Id);
            using (var dbContext = _database.CreateDbContext())
            {
                await new EfNoteLinkRepository(dbContext).AddRangeAsync(new[] { link });
            }
            var deletedId = deleteTheSmallestId ? link.NoteAId : link.NoteBId;

            using (var dbContext = _database.CreateDbContext())
            {
                await new EfNoteRepository(dbContext).DeleteAsync(deletedId);
            }

            using var readContext = _database.CreateDbContext();
            Assert.Equal(0, await readContext.NoteLinks.CountAsync());
            Assert.Equal(2, await readContext.Notes.CountAsync());
        }

        [Fact]
        public async Task DeleteAsync_OfANote_KeepsTheLinksOfTheOtherNotes()
        {
            var deleted = Note.Create("Supprimée", null);
            var first = Note.Create("Première", null);
            var second = Note.Create("Seconde", null);
            await SeedAsync(deleted, first, second);
            var kept = NoteLink.Create(first.Id, second.Id);
            using (var dbContext = _database.CreateDbContext())
            {
                await new EfNoteLinkRepository(dbContext).AddRangeAsync(new[] { NoteLink.Create(deleted.Id, first.Id), kept });
            }

            using (var dbContext = _database.CreateDbContext())
            {
                await new EfNoteRepository(dbContext).DeleteAsync(deleted.Id);
            }

            using var readContext = _database.CreateDbContext();
            Assert.Equal(kept.Id, (await readContext.NoteLinks.SingleAsync()).Id);
        }

        private async Task SeedAsync(params Note[] notes)
        {
            using var dbContext = _database.CreateDbContext();
            dbContext.Notes.AddRange(notes);
            await dbContext.SaveChangesAsync();
        }
    }
}
