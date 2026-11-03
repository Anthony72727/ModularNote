using Application.Links.Abstractions.Services;
using Application.Notes.Abstractions.UseCases;
using Application.Notes.DTOs;
using Domain.Entities;
using Domain.Repositories;

namespace Application.Notes.UseCases
{
    /// <summary>
    /// Implementation of the use case of adding a note
    /// </summary>
    public class AddNoteUseCase : IAddNoteUseCase
    {
        private readonly INoteRepository _noteRepository;
        private readonly INoteLinkService _noteLinkService;
        private readonly IUnitOfWork _unitOfWork;

        /// <summary>
        /// Instantiate the use case
        /// </summary>
        /// <param name="noteRepository">The repository in charge of the notes, injected by dependency injection</param>
        /// <param name="noteLinkService">The service that links the notes, injected by dependency injection</param>
        /// <param name="unitOfWork">The transaction that groups the note and its links, injected by dependency injection</param>
        public AddNoteUseCase(INoteRepository noteRepository, INoteLinkService noteLinkService, IUnitOfWork unitOfWork)
        {
            _noteRepository = noteRepository;
            _noteLinkService = noteLinkService;
            _unitOfWork = unitOfWork;
        }

        /// <inheritdoc />
        public async Task<NoteDto> ExecuteAsync(AddNoteRequestDto request, CancellationToken cancellationToken = default)
        {
            Note note = Note.Create(request.Title, request.Description);
            List<Guid> linkedNoteIds = request.LinkedNoteIds ?? new();
            await _unitOfWork.ExecuteInTransactionAsync(async token =>
            {
                await _noteRepository.AddAsync(note, token);
                await _noteLinkService.AddLinksAsync(note.Id, linkedNoteIds, token);
            }, cancellationToken);
            return NoteDto.FromNote(note);
        }
    }
}
