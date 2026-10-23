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

        /// <summary>
        /// Instantiate the use case
        /// </summary>
        /// <param name="noteRepository">The repository in charge of the notes, injected by dependency injection</param>
        public AddNoteUseCase(INoteRepository noteRepository)
        {
            _noteRepository = noteRepository;
        }

        /// <inheritdoc />
        public async Task<NoteDto> ExecuteAsync(AddNoteRequestDto request, CancellationToken cancellationToken = default)
        {
            Note note = Note.Create(request.Title, request.Description);
            await _noteRepository.AddAsync(note, cancellationToken);
            return NoteDto.FromNote(note);
        }
    }
}
