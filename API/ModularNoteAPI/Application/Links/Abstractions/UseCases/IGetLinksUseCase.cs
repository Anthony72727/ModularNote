using Application.Links.DTOs;

namespace Application.Links.Abstractions.UseCases
{
    /// <summary>
    /// Use case that represents the user's action of getting every link between the notes
    /// </summary>
    public interface IGetLinksUseCase
    {
        /// <summary>
        /// Execute the use case of getting every link between the notes
        /// </summary>
        /// <param name="cancellationToken">The cancellation token</param>
        /// <returns>Every link, in no particular order</returns>
        Task<GetLinksResponseDto> ExecuteAsync(CancellationToken cancellationToken = default);
    }
}
