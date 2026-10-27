using Domain.Repositories;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure
{
    /// <summary>
    /// Registers the Infrastructure layer (database, repositories) in the dependency injection container
    /// </summary>
    public static class DependencyInjection
    {
        /// <summary>
        /// Name of the connection string in appsettings.json ("ConnectionStrings" section)
        /// </summary>
        public const string ConnectionStringName = "ModularNote";

        /// <summary>
        /// Register the DbContext and the repositories
        /// </summary>
        /// <param name="services">The service collection of the application</param>
        /// <param name="configuration">The configuration of the application, used to read the connection string</param>
        /// <returns>The same service collection, to chain the calls</returns>
        /// <exception cref="InvalidOperationException">The connection string is missing</exception>
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            string connectionString = configuration.GetConnectionString(ConnectionStringName)
                ?? throw new InvalidOperationException($"Connection string '{ConnectionStringName}' is missing.");

            services.AddDbContext<ModularNoteDbContext>(options => options.UseSqlite(connectionString));
            services.AddScoped<INoteRepository, EfNoteRepository>();

            return services;
        }

        /// <summary>
        /// Apply the pending migrations to the database, creating it if it does not exist
        /// </summary>
        /// <param name="services">The service provider of the built application</param>
        public static void ApplyMigrations(this IServiceProvider services)
        {
            using IServiceScope scope = services.CreateScope();
            ModularNoteDbContext dbContext = scope.ServiceProvider.GetRequiredService<ModularNoteDbContext>();
            dbContext.Database.Migrate();
        }
    }
}
