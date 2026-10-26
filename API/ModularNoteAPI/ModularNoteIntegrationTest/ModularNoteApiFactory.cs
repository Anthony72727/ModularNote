using Infrastructure;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;

namespace ModularNoteIntegrationTest;

/// <summary>
/// Starts the real API on its own temporary SQLite file, so the tests never touch modularnote.db.
/// One factory = one empty database (shared by the tests of a class when used as a fixture).
/// </summary>
public class ModularNoteApiFactory : WebApplicationFactory<Program>
{
    private readonly string _databasePath = Path.Combine(Path.GetTempPath(), $"modularnote-integration-{Guid.NewGuid()}.db");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting($"ConnectionStrings:{DependencyInjection.ConnectionStringName}", $"Data Source={_databasePath}");
    }

    public string DatabasePath => _databasePath;

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        // SQLite keeps the file open in its connection pool
        SqliteConnection.ClearAllPools();
        File.Delete(_databasePath);
    }
}
