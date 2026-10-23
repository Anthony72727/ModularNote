using Application.Notes.Abstractions.UseCases;
using Application.Notes.DTOs;
using Domain.Entities;
using Domain.Repositories;

namespace Application.Notes.UseCases
{
    /// <summary>
    /// Implementation of the use case of getting all notes
    /// </summary>
    public class GetNotesUseCase : IGetNotesUseCase
    {
        private readonly INoteRepository _noteRepository;

        /// <summary>
        /// Instantiate the use case
        /// </summary>
        /// <param name="noteRepository">The repository in charge of the notes, injected by dependency injection</param>
        public GetNotesUseCase(INoteRepository noteRepository)
        {
            _noteRepository = noteRepository;
        }

        /// <inheritdoc />
        public async Task<GetNotesResponseDto> ExecuteAsync(CancellationToken cancellationToken = default)
        {
            List<Note> notes = await _noteRepository.GetAllAsync(cancellationToken);
            return new GetNotesResponseDto
            {
                Notes = notes.ConvertAll(NoteDto.FromNote)
            };
        }
    }
}
