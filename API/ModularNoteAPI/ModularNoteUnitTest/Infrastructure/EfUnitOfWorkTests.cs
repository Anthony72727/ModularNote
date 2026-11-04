using Domain.Entities;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ModularNoteUnitTest.Infrastructure
{
    public class EfUnitOfWorkTests : IDisposable
    {
        private readonly SqliteInMemoryDatabase _database = new();

        public void Dispose()
        {
            _database.Dispose();
        }

        [Fact]
        public async Task ExecuteInTransactionAsync_ActionEndsNormally_SavesTheWrites()
        {
            using (var dbContext = _database.CreateDbContext())
            {
                var repository = new EfNoteRepository(dbContext);

                await new EfUnitOfWork(dbContext).ExecuteInTransactionAsync(token => repository.AddAsync(Note.Create("Idée", null), token));
            }

            using var readContext = _database.CreateDbContext();
            Assert.Equal(1, await readContext.Notes.CountAsync());
        }

        [Fact]
        public async Task ExecuteInTransactionAsync_ActionThrows_CancelsEveryWrite()
        {
            using (var dbContext = _database.CreateDbContext())
            {
                var repository = new EfNoteRepository(dbContext);

                await Assert.ThrowsAsync<InvalidOperationException>(() => new EfUnitOfWork(dbContext).ExecuteInTransactionAsync(async token =>
                {
                    await repository.AddAsync(Note.Create("Idée", null), token);
                    throw new InvalidOperationException();
                }));
            }

            using var readContext = _database.CreateDbContext();
            Assert.Equal(0, await readContext.Notes.CountAsync());
        }
    }
}
