using Application.Links.UseCases;
using Application.Notes.Exceptions;
using Domain.Entities;
using ModularNoteUnitTest.Application.Fakes;

namespace ModularNoteUnitTest.Application.Links
{
    public class GetNoteLinksUseCaseTests
    {
        private readonly FakeNoteRepository _noteRepository = new();
        private readonly FakeNoteLinkRepository _linkRepository = new();
        private readonly GetNoteLinksUseCase _useCase;

        public GetNoteLinksUseCaseTests()
        {
            _useCase = new GetNoteLinksUseCase(_noteRepository, _linkRepository);
        }

        [Fact]
        public async Task ExecuteAsync_ExistingNote_ReturnsTheLinkedNotes()
        {
            var note = Note.Create("Idée", null);
            var linked = Note.Create("Liée", "Description");
            _noteRepository.Notes.Add(note);
            _linkRepository.LinkedNotes.Add(linked);

            var result = await _useCase.ExecuteAsync(note.Id);

            var dto = Assert.Single(result.Notes);
            Assert.Equal(linked.Id, dto.Id);
            Assert.Equal("Liée", dto.Title);
        }

        [Fact]
        public async Task ExecuteAsync_WithUnknownId_ThrowsNoteNotFound()
        {
            await Assert.ThrowsAsync<NoteNotFoundException>(() => _useCase.ExecuteAsync(Guid.NewGuid()));
        }
    }
}
