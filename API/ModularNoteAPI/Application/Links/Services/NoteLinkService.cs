using Application.Links.Abstractions.Services;
using Application.Links.Exceptions;
using Domain.Entities;
using Domain.Repositories;

namespace Application.Links.Services
{
    /// <summary>
    /// Implementation of the logic shared by the use cases that link notes
    /// </summary>
    public class NoteLinkService : INoteLinkService
    {
        private readonly INoteRepository _noteRepository;
        private readonly INoteLinkRepository _noteLinkRepository;

        /// <summary>
        /// Instantiate the service
        /// </summary>
        /// <param name="noteRepository">The repository in charge of the notes, injected by dependency injection</param>
        /// <param name="noteLinkRepository">The repository in charge of the links, injected by dependency injection</param>
        public NoteLinkService(INoteRepository noteRepository, INoteLinkRepository noteLinkRepository)
        {
            _noteRepository = noteRepository;
            _noteLinkRepository = noteLinkRepository;
        }

        /// <inheritdoc />
        public async Task AddLinksAsync(Guid noteId, IEnumerable<Guid> linkedNoteIds, CancellationToken cancellationToken = default)
        {
            List<Guid> distinctIds = linkedNoteIds.Distinct().ToList();
            if (distinctIds.Count == 0)
            {
                return;
            }

            List<Guid> existingIds = await _noteRepository.GetExistingIdsAsync(distinctIds, cancellationToken);
            List<Guid> missingIds = distinctIds.Except(existingIds).ToList();
            if (missingIds.Count > 0)
            {
                throw new LinkedNoteNotFoundException(missingIds);
            }

            List<NoteLink> links = distinctIds.ConvertAll(linkedNoteId => NoteLink.Create(noteId, linkedNoteId));
            await _noteLinkRepository.AddRangeAsync(links, cancellationToken);
        }
    }
}
