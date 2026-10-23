using Domain.Entities;
using Domain.Repositories;

namespace ModularNoteUnitTest.Application.Fakes
{
    /// <summary>
    /// In-memory note repository used to test the use cases
    /// </summary>
    public class FakeNoteRepository : INoteRepository
    {
        public List<Note> Notes { get; } = new();

        public Task AddAsync(Note note, CancellationToken cancellationToken = default)
        {
            Notes.Add(note);
            return Task.CompletedTask;
        }

        public Task<List<Note>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Notes.ToList());
        }

        public Task<Note?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Notes.FirstOrDefault(note => note.Id == id));
        }
    }
}
