using Application.Notes.DTOs;

namespace Application.Notes.Abstractions.UseCases
{
    /// <summary>
    /// Use case that represents the user's action of getting all notes
    /// </summary>
    public interface IGetNotesUseCase
    {
        /// <summary>
        /// Execute the use case of getting all notes
        /// </summary>
        /// <param name="cancellationToken">The cancellation token</param>
        /// <returns>All the notes</returns>
        Task<GetNotesResponseDto> ExecuteAsync(CancellationToken cancellationToken = default);
    }
}
