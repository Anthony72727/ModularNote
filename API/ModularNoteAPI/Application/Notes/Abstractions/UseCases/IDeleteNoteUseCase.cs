using Application.Notes.Exceptions;

namespace Application.Notes.Abstractions.UseCases
{
    /// <summary>
    /// Use case that represents the user's action of deleting a note
    /// </summary>
    public interface IDeleteNoteUseCase
    {
        /// <summary>
        /// Execute the use case of deleting a note
        /// </summary>
        /// <param name="id">The id of the note to delete</param>
        /// <param name="cancellationToken">The cancellation token</param>
        /// <exception cref="NoteNotFoundException">No note has the specified id</exception>
        Task ExecuteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
