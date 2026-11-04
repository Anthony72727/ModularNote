using Application.Links.Exceptions;
using Application.Links.Services;
using Application.Notes.DTOs;
using Application.Notes.UseCases;
using Domain.Entities;
using Domain.Exceptions;
using ModularNoteUnitTest.Application.Fakes;

namespace ModularNoteUnitTest.Application.Notes
{
    public class AddNoteUseCaseTests
    {
        private readonly FakeNoteRepository _repository = new();
        private readonly FakeNoteLinkRepository _linkRepository = new();
        private readonly FakeUnitOfWork _unitOfWork = new();
        private readonly AddNoteUseCase _useCase;

        public AddNoteUseCaseTests()
        {
            _useCase = new AddNoteUseCase(_repository, new NoteLinkService(_repository, _linkRepository), _unitOfWork);
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
            Assert.Equal(0, _unitOfWork.CommitCount);
        }

        [Fact]
        public async Task ExecuteAsync_WithoutLinkedNotes_AddsNoLink()
        {
            await _useCase.ExecuteAsync(new AddNoteRequestDto { Title = "Idée", LinkedNoteIds = null });

            Assert.Empty(_linkRepository.Links);
            Assert.Equal(1, _unitOfWork.CommitCount);
        }

        [Fact]
        public async Task ExecuteAsync_WithLinkedNote_SavesTheLinkInTheTransaction()
        {
            var existing = Note.Create("Existante", null);
            _repository.Notes.Add(existing);

            var result = await _useCase.ExecuteAsync(new AddNoteRequestDto { Title = "Idée", LinkedNoteIds = new List<Guid> { existing.Id } });

            var link = Assert.Single(_linkRepository.Links);
            Assert.Equal(new[] { existing.Id, result.Id }.Order(), new[] { link.NoteAId, link.NoteBId });
            Assert.Equal(1, _unitOfWork.CommitCount);
        }

        [Fact]
        public async Task ExecuteAsync_WithMissingLinkedNote_DoesNotCommit()
        {
            var request = new AddNoteRequestDto { Title = "Idée", LinkedNoteIds = new List<Guid> { Guid.NewGuid() } };

            await Assert.ThrowsAsync<LinkedNoteNotFoundException>(() => _useCase.ExecuteAsync(request));

            Assert.Empty(_linkRepository.Links);
            Assert.Equal(0, _unitOfWork.CommitCount);
        }
    }
}
