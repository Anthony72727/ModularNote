using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    /// <summary>
    /// The Entity Framework implementation of the note repository
    /// </summary>
    public class EfNoteRepository : INoteRepository
    {
        private readonly ModularNoteDbContext _dbContext;

        /// <summary>
        /// Instantiate the repository
        /// </summary>
        /// <param name="dbContext">The database context, injected by dependency injection</param>
        public EfNoteRepository(ModularNoteDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <inheritdoc/>
        public async Task AddAsync(Note note, CancellationToken cancellationToken = default)
        {
            _dbContext.Notes.Add(note);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        /// <inheritdoc/>
        public async Task<List<Note>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _dbContext.Notes
                .AsNoTracking()
                .OrderBy(n => n.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        /// <inheritdoc/>
        public async Task<Note?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _dbContext.Notes
                .AsNoTracking()
                .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
        }

        /// <inheritdoc/>
        public async Task UpdateAsync(Note note, CancellationToken cancellationToken = default)
        {
            // The notes are read without tracking: the note has to be attached to the context again
            _dbContext.Notes.Update(note);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
