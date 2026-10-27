using Domain.Repositories;
using Infrastructure;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ModularNoteUnitTest.Infrastructure
{
    public class DependencyInjectionTests : IDisposable
    {
        private readonly string _databasePath = Path.Combine(Path.GetTempPath(), $"modularnote-test-{Guid.NewGuid()}.db");

        public void Dispose()
        {
            // SQLite keeps the file open in its connection pool
            Microsoft.Data.Sqlite.SqliteConnection.ClearAllPools();
            File.Delete(_databasePath);
        }

        [Fact]
        public void AddInfrastructure_WithoutConnectionString_Throws()
        {
            var configuration = new ConfigurationBuilder().Build();
            var services = new ServiceCollection();

            var exception = Assert.Throws<InvalidOperationException>(() => services.AddInfrastructure(configuration));

            Assert.Contains(DependencyInjection.ConnectionStringName, exception.Message);
        }

        [Fact]
        public void AddInfrastructure_RegistersTheEfNoteRepositoryAsScoped()
        {
            var services = new ServiceCollection().AddInfrastructure(BuildConfiguration());

            var descriptor = Assert.Single(services, service => service.ServiceType == typeof(INoteRepository));

            Assert.Equal(typeof(EfNoteRepository), descriptor.ImplementationType);
            Assert.Equal(ServiceLifetime.Scoped, descriptor.Lifetime);
        }

        [Fact]
        public void AddInfrastructure_UsesSqliteWithTheConfiguredConnectionString()
        {
            using var provider = new ServiceCollection().AddInfrastructure(BuildConfiguration()).BuildServiceProvider();
            using var scope = provider.CreateScope();

            var dbContext = scope.ServiceProvider.GetRequiredService<ModularNoteDbContext>();

            Assert.Equal("Microsoft.EntityFrameworkCore.Sqlite", dbContext.Database.ProviderName);
            Assert.Contains(_databasePath, dbContext.Database.GetConnectionString());
        }

        [Fact]
        public void ApplyMigrations_CreatesTheDatabaseWithAllMigrations()
        {
            using var provider = new ServiceCollection().AddInfrastructure(BuildConfiguration()).BuildServiceProvider();

            provider.ApplyMigrations();

            using var scope = provider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ModularNoteDbContext>();
            Assert.True(File.Exists(_databasePath));
            Assert.Empty(dbContext.Database.GetPendingMigrations());
            Assert.Equal(dbContext.Database.GetMigrations(), dbContext.Database.GetAppliedMigrations());
        }

        [Fact]
        public void ApplyMigrations_CalledTwice_DoesNotFail()
        {
            using var provider = new ServiceCollection().AddInfrastructure(BuildConfiguration()).BuildServiceProvider();

            provider.ApplyMigrations();
            var exception = Record.Exception(() => provider.ApplyMigrations());

            Assert.Null(exception);
        }

        private IConfiguration BuildConfiguration()
        {
            return new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    [$"ConnectionStrings:{DependencyInjection.ConnectionStringName}"] = $"Data Source={_databasePath}"
                })
                .Build();
        }
    }
}
