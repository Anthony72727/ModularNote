using Application.Notes.Abstractions.UseCases;
using Application.Notes.DTOs;
using Application.Notes.Exceptions;
using Domain.Entities;
using Domain.Repositories;

namespace Application.Notes.UseCases
{
    /// <summary>
    /// Implementation of the use case of updating a note
    /// </summary>
    public class UpdateNoteUseCase : IUpdateNoteUseCase
    {
        private readonly INoteRepository _noteRepository;

        /// <summary>
        /// Instantiate the use case
        /// </summary>
        /// <param name="noteRepository">The repository in charge of the notes, injected by dependency injection</param>
        public UpdateNoteUseCase(INoteRepository noteRepository)
        {
            _noteRepository = noteRepository;
        }

        /// <inheritdoc />
        public async Task<NoteDto> ExecuteAsync(Guid id, UpdateNoteRequestDto request, CancellationToken cancellationToken = default)
        {
            Note note = await _noteRepository.GetByIdAsync(id, cancellationToken)
                ?? throw new NoteNotFoundException();
            note.Update(request.Title, request.Description);
            bool updated = await _noteRepository.UpdateAsync(note, cancellationToken);
            if (!updated)
            {
                // The note was deleted between its reading and its saving
                throw new NoteNotFoundException();
            }
            return NoteDto.FromNote(note);
        }
    }
}
