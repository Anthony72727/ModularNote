using Application.Notes.UseCases;
using Domain.Entities;
using ModularNoteUnitTest.Application.Fakes;

namespace ModularNoteUnitTest.Application.Notes
{
    public class GetNotesUseCaseTests
    {
        private readonly FakeNoteRepository _repository = new();
        private readonly GetNotesUseCase _useCase;

        public GetNotesUseCaseTests()
        {
            _useCase = new GetNotesUseCase(_repository);
        }

        [Fact]
        public async Task ExecuteAsync_ReturnsAllNotes()
        {
            _repository.Notes.Add(Note.Create("Première", null));
            _repository.Notes.Add(Note.Create("Seconde", "Description"));

            var result = await _useCase.ExecuteAsync();

            Assert.Equal(new[] { "Première", "Seconde" }, result.Notes.Select(note => note.Title));
        }

        [Fact]
        public async Task ExecuteAsync_WithoutNotes_ReturnsEmptyList()
        {
            var result = await _useCase.ExecuteAsync();

            Assert.Empty(result.Notes);
        }
    }
}
