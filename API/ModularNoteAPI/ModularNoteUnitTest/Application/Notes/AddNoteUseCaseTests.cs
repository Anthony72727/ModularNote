using Application.Notes.DTOs;
using Application.Notes.UseCases;
using Domain.Exceptions;
using ModularNoteUnitTest.Application.Fakes;

namespace ModularNoteUnitTest.Application.Notes
{
    public class AddNoteUseCaseTests
    {
        private readonly FakeNoteRepository _repository = new();
        private readonly AddNoteUseCase _useCase;

        public AddNoteUseCaseTests()
        {
            _useCase = new AddNoteUseCase(_repository);
        }

        [Fact]
        public async Task ExecuteAsync_WithValidRequest_SavesAndReturnsNote()
        {
            var request = new AddNoteRequestDto { Title = "  Idée  ", Description = "Description" };

            var result = await _useCase.ExecuteAsync(request);

            var saved = Assert.Single(_repository.Notes);
            Assert.Equal(saved.Id, result.Id);
            Assert.Equal("Idée", result.Title);
            Assert.Equal("Description", result.Description);
            Assert.Equal(saved.CreatedAt, result.CreatedAt);
        }

        [Fact]
        public async Task ExecuteAsync_WithInvalidTitle_ThrowsAndSavesNothing()
        {
            var request = new AddNoteRequestDto { Title = "   " };

            await Assert.ThrowsAsync<TitleInvalidException>(() => _useCase.ExecuteAsync(request));

            Assert.Empty(_repository.Notes);
        }
    }
}
