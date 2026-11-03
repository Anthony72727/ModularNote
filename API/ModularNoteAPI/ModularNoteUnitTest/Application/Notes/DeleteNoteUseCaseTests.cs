using Application.Notes.Exceptions;
using Application.Notes.UseCases;
using Domain.Entities;
using ModularNoteUnitTest.Application.Fakes;

namespace ModularNoteUnitTest.Application.Notes
{
    public class DeleteNoteUseCaseTests
    {
        private readonly FakeNoteRepository _repository = new();
        private readonly DeleteNoteUseCase _useCase;

        public DeleteNoteUseCaseTests()
        {
            _useCase = new DeleteNoteUseCase(_repository);
        }

        [Fact]
        public async Task ExecuteAsync_ExistingNote_DeletesOnlyThisNote()
        {
            var note = Note.Create("Titre", null);
            var other = Note.Create("Autre", null);
            _repository.Notes.AddRange(new[] { note, other });

            await _useCase.ExecuteAsync(note.Id);

            Assert.Same(other, Assert.Single(_repository.Notes));
        }

        [Fact]
        public async Task ExecuteAsync_WithUnknownId_ThrowsNoteNotFound()
        {
            var other = Note.Create("Autre", null);
            _repository.Notes.Add(other);

            await Assert.ThrowsAsync<NoteNotFoundException>(() => _useCase.ExecuteAsync(Guid.NewGuid()));

            Assert.Same(other, Assert.Single(_repository.Notes));
        }
    }
}
