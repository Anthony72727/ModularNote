using Application.Notes.DTOs;
using Application.Notes.Exceptions;

namespace Application.Notes.Abstractions.UseCases
{
    /// <summary>
    /// Use case that represents the user's action of getting a note by its id
    /// </summary>
    public interface IGetNoteByIdUseCase
    {
        /// <summary>
        /// Execute the use case of getting a note by its id
        /// </summary>
        /// <param name="id">The id of the note to get</param>
        /// <param name="cancellationToken">The cancellation token</param>
        /// <returns>The note with the specified id</returns>
        /// <exception cref="NoteNotFoundException">No note has the specified id</exception>
        Task<NoteDto> ExecuteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
