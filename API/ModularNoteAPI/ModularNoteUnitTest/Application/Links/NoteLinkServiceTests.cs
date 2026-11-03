using Application.Links.Exceptions;
using Application.Links.Services;
using Domain.Entities;
using ModularNoteUnitTest.Application.Fakes;

namespace ModularNoteUnitTest.Application.Links
{
    public class NoteLinkServiceTests
    {
        private readonly FakeNoteRepository _noteRepository = new();
        private readonly FakeNoteLinkRepository _linkRepository = new();
        private readonly NoteLinkService _service;

        public NoteLinkServiceTests()
        {
            _service = new NoteLinkService(_noteRepository, _linkRepository);
        }

        [Fact]
        public async Task AddLinksAsync_WithExistingNotes_LinksEachOfThem()
        {
            var first = Note.Create("Première", null);
            var second = Note.Create("Seconde", null);
            _noteRepository.Notes.AddRange(new[] { first, second });
            var noteId = Guid.CreateVersion7();

            await _service.AddLinksAsync(noteId, new[] { first.Id, second.Id });

            Assert.Equal(2, _linkRepository.Links.Count);
            Assert.All(_linkRepository.Links, link => Assert.True(link.NoteAId == noteId || link.NoteBId == noteId));
        }

        [Fact]
        public async Task AddLinksAsync_WithTheSameNoteTwice_LinksItOnce()
        {
            var note = Note.Create("Idée", null);
            _noteRepository.Notes.Add(note);

            await _service.AddLinksAsync(Guid.CreateVersion7(), new[] { note.Id, note.Id });

            Assert.Single(_linkRepository.Links);
        }

        [Fact]
        public async Task AddLinksAsync_WithoutNotes_AddsNothing()
        {
            await _service.AddLinksAsync(Guid.CreateVersion7(), Array.Empty<Guid>());

            Assert.Empty(_linkRepository.Links);
        }

        [Fact]
        public async Task AddLinksAsync_WithMissingNotes_NamesThemAndAddsNothing()
        {
            var note = Note.Create("Idée", null);
            _noteRepository.Notes.Add(note);
            var firstMissing = Guid.CreateVersion7();
            var secondMissing = Guid.CreateVersion7();

            var exception = await Assert.ThrowsAsync<LinkedNoteNotFoundException>(
                () => _service.AddLinksAsync(Guid.CreateVersion7(), new[] { note.Id, firstMissing, secondMissing }));

            Assert.Contains(firstMissing.ToString(), exception.Message);
            Assert.Contains(secondMissing.ToString(), exception.Message);
            Assert.DoesNotContain(note.Id.ToString(), exception.Message);
            Assert.Empty(_linkRepository.Links);
        }
    }
}
