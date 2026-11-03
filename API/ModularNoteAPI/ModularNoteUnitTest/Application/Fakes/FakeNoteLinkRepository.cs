using Domain.Entities;
using Domain.Repositories;

namespace ModularNoteUnitTest.Application.Fakes
{
    /// <summary>
    /// In-memory repository of the links, used to test the use cases
    /// </summary>
    public class FakeNoteLinkRepository : INoteLinkRepository
    {
        public List<NoteLink> Links { get; } = new();

        public List<Note> LinkedNotes { get; } = new();

        public Task AddRangeAsync(IEnumerable<NoteLink> links, CancellationToken cancellationToken = default)
        {
            Links.AddRange(links);
            return Task.CompletedTask;
        }

        public Task<List<Note>> GetLinkedNotesAsync(Guid noteId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(LinkedNotes.ToList());
        }
    }
}
