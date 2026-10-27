using Application.Notes.Exceptions;
using Application.Notes.UseCases;
using Domain.Entities;
using ModularNoteUnitTest.Application.Fakes;

namespace ModularNoteUnitTest.Application.Notes
{
    public class GetNoteByIdUseCaseTests
    {
        private readonly FakeNoteRepository _repository = new();
        private readonly GetNoteByIdUseCase _useCase;

        public GetNoteByIdUseCaseTests()
        {
            _useCase = new GetNoteByIdUseCase(_repository);
        }

        [Fact]
        public async Task ExecuteAsync_WithExistingId_ReturnsNote()
        {
            var note = Note.Create("Idée", "Description");
            _repository.Notes.Add(note);

            var result = await _useCase.ExecuteAsync(note.Id);

            Assert.Equal(note.Id, result.Id);
            Assert.Equal("Idée", result.Title);
            Assert.Equal("Description", result.Description);
        }

        [Fact]
        public async Task ExecuteAsync_WithUnknownId_ThrowsNoteNotFound()
        {
            await Assert.ThrowsAsync<NoteNotFoundException>(() => _useCase.ExecuteAsync(Guid.NewGuid()));
        }
    }
}
