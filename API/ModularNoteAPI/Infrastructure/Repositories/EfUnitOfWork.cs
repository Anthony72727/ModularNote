using Domain.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace Infrastructure.Repositories
{
    /// <summary>
    /// The Entity Framework implementation of the unit of work, on the DbContext shared by the repositories of the request
    /// </summary>
    public class EfUnitOfWork : IUnitOfWork
    {
        private readonly ModularNoteDbContext _dbContext;

        /// <summary>
        /// Instantiate the unit of work
        /// </summary>
        /// <param name="dbContext">The database context, injected by dependency injection</param>
        public EfUnitOfWork(ModularNoteDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <inheritdoc/>
        public async Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken = default)
        {
            // Disposing the transaction without committing it rolls everything back
            await using IDbContextTransaction transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
            await action(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
    }
}
