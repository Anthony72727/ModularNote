using Application.Notes.Abstractions.UseCases;
using Application.Notes.DTOs;
using Application.Notes.Exceptions;
using Domain.Entities;
using Domain.Repositories;

namespace Application.Notes.UseCases
{
    /// <summary>
    /// Implementation of the use case of getting a note by its id
    /// </summary>
    public class GetNoteByIdUseCase : IGetNoteByIdUseCase
    {
        private readonly INoteRepository _noteRepository;

        /// <summary>
        /// Instantiate the use case
        /// </summary>
        /// <param name="noteRepository">The repository in charge of the notes, injected by dependency injection</param>
        public GetNoteByIdUseCase(INoteRepository noteRepository)
        {
            _noteRepository = noteRepository;
        }

        /// <inheritdoc />
        public async Task<NoteDto> ExecuteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            Note note = await _noteRepository.GetByIdAsync(id, cancellationToken)
                ?? throw new NoteNotFoundException();
            return NoteDto.FromNote(note);
        }
    }
}
