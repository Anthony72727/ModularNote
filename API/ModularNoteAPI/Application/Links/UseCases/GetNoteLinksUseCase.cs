using Application.Links.Abstractions.UseCases;
using Application.Notes.DTOs;
using Application.Notes.Exceptions;
using Domain.Entities;
using Domain.Repositories;

namespace Application.Links.UseCases
{
    /// <summary>
    /// Implementation of the use case of getting the notes linked to a note
    /// </summary>
    public class GetNoteLinksUseCase : IGetNoteLinksUseCase
    {
        private readonly INoteRepository _noteRepository;
        private readonly INoteLinkRepository _noteLinkRepository;

        /// <summary>
        /// Instantiate the use case
        /// </summary>
        /// <param name="noteRepository">The repository in charge of the notes, injected by dependency injection</param>
        /// <param name="noteLinkRepository">The repository in charge of the links, injected by dependency injection</param>
        public GetNoteLinksUseCase(INoteRepository noteRepository, INoteLinkRepository noteLinkRepository)
        {
            _noteRepository = noteRepository;
            _noteLinkRepository = noteLinkRepository;
        }

        /// <inheritdoc />
        public async Task<GetNotesResponseDto> ExecuteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            if (await _noteRepository.GetByIdAsync(id, cancellationToken) is null)
            {
                throw new NoteNotFoundException();
            }

            List<Note> notes = await _noteLinkRepository.GetLinkedNotesAsync(id, cancellationToken);
            return new GetNotesResponseDto
            {
                Notes = notes.ConvertAll(NoteDto.FromNote)
            };
        }
    }
}
