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

        public List<Note> UpdatedNotes { get; } = new();

        /// <summary>
        /// Simulates a note deleted between its reading and its saving
        /// </summary>
        public bool NoteDeletedBeforeUpdate { get; set; }

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

        public Task<List<Guid>> GetExistingIdsAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Notes.Where(note => ids.Contains(note.Id)).Select(note => note.Id).ToList());
        }

        public Task<bool> UpdateAsync(Note note, CancellationToken cancellationToken = default)
        {
            if (NoteDeletedBeforeUpdate)
            {
                return Task.FromResult(false);
            }

            UpdatedNotes.Add(note);
            return Task.FromResult(true);
        }

        public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Notes.RemoveAll(note => note.Id == id) > 0);
        }
    }
}
