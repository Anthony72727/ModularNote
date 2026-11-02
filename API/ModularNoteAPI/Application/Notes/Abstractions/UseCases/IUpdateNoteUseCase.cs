using Application.Notes.DTOs;

namespace Application.Notes.Abstractions.UseCases
{
    /// <summary>
    /// Use case that represents the user's action of updating a note
    /// </summary>
    public interface IUpdateNoteUseCase
    {
        /// <summary>
        /// Execute the use case of updating a note
        /// </summary>
        /// <param name="id">The id of the note to update</param>
        /// <param name="request">The new data of the note</param>
        /// <param name="cancellationToken">The cancellation token</param>
        /// <returns>The updated note</returns>
        Task<NoteDto> ExecuteAsync(Guid id, UpdateNoteRequestDto request, CancellationToken cancellationToken = default);
    }
}
