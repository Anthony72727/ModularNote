using Application.Links.Abstractions.UseCases;
using Application.Links.DTOs;
using Domain.Entities;
using Domain.Repositories;

namespace Application.Links.UseCases
{
    /// <summary>
    /// Implementation of the use case of getting every link between the notes
    /// </summary>
    public class GetLinksUseCase : IGetLinksUseCase
    {
        private readonly INoteLinkRepository _noteLinkRepository;

        /// <summary>
        /// Instantiate the use case
        /// </summary>
        /// <param name="noteLinkRepository">The repository in charge of the links, injected by dependency injection</param>
        public GetLinksUseCase(INoteLinkRepository noteLinkRepository)
        {
            _noteLinkRepository = noteLinkRepository;
        }

        /// <inheritdoc />
        public async Task<GetLinksResponseDto> ExecuteAsync(CancellationToken cancellationToken = default)
        {
            List<NoteLink> links = await _noteLinkRepository.GetAllAsync(cancellationToken);
            return new GetLinksResponseDto
            {
                Links = links.ConvertAll(NoteLinkDto.FromNoteLink)
            };
        }
    }
}
