using Infrastructure.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace ModularNoteUnitTest.Infrastructure
{
    /// <summary>
    /// In-memory SQLite database, created with the real migrations, used to test the Infrastructure layer.
    /// The database lives as long as the connection is open.
    /// </summary>
    public sealed class SqliteInMemoryDatabase : IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly DbContextOptions<ModularNoteDbContext> _options;

        public SqliteInMemoryDatabase()
        {
            _connection = new SqliteConnection("Data Source=:memory:");
            _connection.Open();

            _options = new DbContextOptionsBuilder<ModularNoteDbContext>()
                .UseSqlite(_connection)
                .Options;

            using var dbContext = CreateDbContext();
            dbContext.Database.Migrate();
        }

        /// <summary>
        /// Create a new context on the same database (a new context has an empty change tracker)
        /// </summary>
        public ModularNoteDbContext CreateDbContext()
        {
            return new ModularNoteDbContext(_options);
        }

        public void Dispose()
        {
            _connection.Dispose();
        }
    }
}
