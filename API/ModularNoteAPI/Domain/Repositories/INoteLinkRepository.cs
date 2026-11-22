using Domain.Entities;

namespace Domain.Repositories
{
    /// <summary>
    /// Provides access to the persistence operations of the links between notes.
    /// </summary>
    public interface INoteLinkRepository
    {
        /// <summary>
        /// Add links in the database
        /// </summary>
        /// <param name="links">The links to add in the database</param>
        /// <param name="cancellationToken">The token to monitor for cancellation requests</param>
        Task AddRangeAsync(IEnumerable<NoteLink> links, CancellationToken cancellationToken = default);

        /// <summary>
        /// Retrieve the notes linked to a note
        /// </summary>
        /// <param name="noteId">The note's id</param>
        /// <param name="cancellationToken">The token to monitor for cancellation requests</param>
        /// <returns>The linked notes, oldest first</returns>
        Task<List<Note>> GetLinkedNotesAsync(Guid noteId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Retrieve every link
        /// </summary>
        /// <param name="cancellationToken">The token to monitor for cancellation requests</param>
        /// <returns>Every link, in no particular order</returns>
        Task<List<NoteLink>> GetAllAsync(CancellationToken cancellationToken = default);
    }
}
