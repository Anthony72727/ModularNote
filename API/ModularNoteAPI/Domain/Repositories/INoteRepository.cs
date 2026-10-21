using Domain.Entities;

namespace Domain.Repositories
{
    /// <summary>
    /// Provides access to note persistence operations.
    /// </summary>
    public interface INoteRepository
    {
        /// <summary>
        /// Add a note in the database
        /// </summary>
        /// <param name="note">The note to add in the database</param>
        /// <param name="cancellationToken">The token to monitor for cancellation requests</param>
        Task AddAsync(Note note, CancellationToken cancellationToken = default);

        /// <summary>
        /// Asynchronously retrieves all notes.
        /// </summary>
        /// <param name="cancellationToken">The token to monitor for cancellation requests</param>
        /// <returns>A task representing the asynchronous operation. The task result contains a list of all notes.</returns>
        Task<List<Note>> GetAllAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Retrieve the asked note
        /// </summary>
        /// <param name="id">The note's id</param>
        /// <param name="cancellationToken">The token to monitor for cancellation requests</param>
        /// <returns>The task corresponding to the id given in parameter, or null if not found</returns>
        Task<Note?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
