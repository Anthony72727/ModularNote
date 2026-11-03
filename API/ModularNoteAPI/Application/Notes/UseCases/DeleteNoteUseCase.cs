using Application.Notes.Abstractions.UseCases;
using Application.Notes.Exceptions;
using Domain.Repositories;

namespace Application.Notes.UseCases
{
    /// <summary>
    /// Implementation of the use case of deleting a note
    /// </summary>
    public class DeleteNoteUseCase : IDeleteNoteUseCase
    {
        private readonly INoteRepository _noteRepository;

        /// <summary>
        /// Instantiate the use case
        /// </summary>
        /// <param name="noteRepository">The repository in charge of the notes, injected by dependency injection</param>
        public DeleteNoteUseCase(INoteRepository noteRepository)
        {
            _noteRepository = noteRepository;
        }

        /// <inheritdoc />
        public async Task ExecuteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            bool deleted = await _noteRepository.DeleteAsync(id, cancellationToken);
            if (!deleted)
            {
                throw new NoteNotFoundException();
            }
        }
    }
}
