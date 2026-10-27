using Application.Notes.DTOs;

namespace Application.Notes.Abstractions.UseCases
{
    /// <summary>
    /// Use case that represents the user's action of adding a note
    /// </summary>
    public interface IAddNoteUseCase
    {
        /// <summary>
        /// Execute the use case of adding a note
        /// </summary>
        /// <param name="request">The data of the note to add</param>
        /// <param name="cancellationToken">The cancellation token</param>
        /// <returns>The added note</returns>
        Task<NoteDto> ExecuteAsync(AddNoteRequestDto request, CancellationToken cancellationToken = default);
    }
}
