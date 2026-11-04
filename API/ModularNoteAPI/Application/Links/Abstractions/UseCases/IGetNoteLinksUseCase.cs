using Application.Notes.DTOs;
using Application.Notes.Exceptions;

namespace Application.Links.Abstractions.UseCases
{
    /// <summary>
    /// Use case that represents the user's action of getting the notes linked to a note
    /// </summary>
    public interface IGetNoteLinksUseCase
    {
        /// <summary>
        /// Execute the use case of getting the notes linked to a note
        /// </summary>
        /// <param name="id">The id of the note</param>
        /// <param name="cancellationToken">The cancellation token</param>
        /// <returns>The linked notes, oldest first</returns>
        /// <exception cref="NoteNotFoundException">No note has the specified id</exception>
        Task<GetNotesResponseDto> ExecuteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
