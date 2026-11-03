using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    /// <summary>
    /// The Entity Framework implementation of the repository of the links between notes
    /// </summary>
    public class EfNoteLinkRepository : INoteLinkRepository
    {
        private readonly ModularNoteDbContext _dbContext;

        /// <summary>
        /// Instantiate the repository
        /// </summary>
        /// <param name="dbContext">The database context, injected by dependency injection</param>
        public EfNoteLinkRepository(ModularNoteDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <inheritdoc/>
        public async Task AddRangeAsync(IEnumerable<NoteLink> links, CancellationToken cancellationToken = default)
        {
            _dbContext.NoteLinks.AddRange(links);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        /// <inheritdoc/>
        public async Task<List<Note>> GetLinkedNotesAsync(Guid noteId, CancellationToken cancellationToken = default)
        {
            return await _dbContext.Notes
                .AsNoTracking()
                .Where(n => _dbContext.NoteLinks.Any(l =>
                    (l.NoteAId == noteId && l.NoteBId == n.Id) || (l.NoteBId == noteId && l.NoteAId == n.Id)))
                .OrderBy(n => n.CreatedAt)
                .ToListAsync(cancellationToken);
        }
    }
}
