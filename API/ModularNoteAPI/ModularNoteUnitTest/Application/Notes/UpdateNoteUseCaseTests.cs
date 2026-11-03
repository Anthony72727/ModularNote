using Application.Notes.DTOs;
using Application.Notes.Exceptions;
using Application.Notes.UseCases;
using Domain.Entities;
using Domain.Exceptions;
using ModularNoteUnitTest.Application.Fakes;

namespace ModularNoteUnitTest.Application.Notes
{
    public class UpdateNoteUseCaseTests
    {
        private readonly FakeNoteRepository _repository = new();
        private readonly UpdateNoteUseCase _useCase;

        public UpdateNoteUseCaseTests()
        {
            _useCase = new UpdateNoteUseCase(_repository);
        }

        [Fact]
        public async Task ExecuteAsync_WithValidValues_SavesAndReturnsTheUpdatedNote()
        {
            var note = Note.Create("Titre", "Description");
            _repository.Notes.Add(note);

            var result = await _useCase.ExecuteAsync(note.Id, new UpdateNoteRequestDto { Title = "  Nouveau titre  ", Description = "Nouvelle description" });

            Assert.Equal(note.Id, result.Id);
            Assert.Equal("Nouveau titre", result.Title);
            Assert.Equal("Nouvelle description", result.Description);
            Assert.Equal(note.CreatedAt, result.CreatedAt);
            Assert.Same(note, Assert.Single(_repository.UpdatedNotes));
        }

        [Fact]
        public async Task ExecuteAsync_WithUnknownId_ThrowsNoteNotFound()
        {
            await Assert.ThrowsAsync<NoteNotFoundException>(() => _useCase.ExecuteAsync(Guid.NewGuid(), new UpdateNoteRequestDto { Title = "Titre" }));

            Assert.Empty(_repository.UpdatedNotes);
        }

        [Fact]
        public async Task ExecuteAsync_NoteDeletedBeforeSaving_ThrowsNoteNotFound()
        {
            var note = Note.Create("Titre", "Description");
            _repository.Notes.Add(note);
            _repository.NoteDeletedBeforeUpdate = true;

            await Assert.ThrowsAsync<NoteNotFoundException>(() => _useCase.ExecuteAsync(note.Id, new UpdateNoteRequestDto { Title = "Nouveau titre" }));
        }

        [Fact]
        public async Task ExecuteAsync_WithInvalidTitle_ThrowsWithoutSaving()
        {
            var note = Note.Create("Titre", "Description");
            _repository.Notes.Add(note);

            await Assert.ThrowsAsync<TitleInvalidException>(() => _useCase.ExecuteAsync(note.Id, new UpdateNoteRequestDto { Title = "   " }));

            Assert.Empty(_repository.UpdatedNotes);
            Assert.Equal("Titre", note.Title);
        }

        [Fact]
        public async Task ExecuteAsync_WithInvalidDescription_ThrowsWithoutSaving()
        {
            var note = Note.Create("Titre", "Description");
            _repository.Notes.Add(note);

            await Assert.ThrowsAsync<DescriptionInvalidException>(() => _useCase.ExecuteAsync(note.Id, new UpdateNoteRequestDto { Title = "Titre", Description = new string('a', Note.DescriptionMaxLength + 1) }));

            Assert.Empty(_repository.UpdatedNotes);
        }
    }
}
