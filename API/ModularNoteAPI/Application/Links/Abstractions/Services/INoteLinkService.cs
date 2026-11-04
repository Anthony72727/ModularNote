using Application.Links.Exceptions;

namespace Application.Links.Abstractions.Services
{
    /// <summary>
    /// Logic shared by the use cases that link notes
    /// </summary>
    public interface INoteLinkService
    {
        /// <summary>
        /// Link a note to other notes, a same note being linked only once
        /// </summary>
        /// <param name="noteId">The id of the note to link</param>
        /// <param name="linkedNoteIds">The ids of the notes to link it to</param>
        /// <param name="cancellationToken">The cancellation token</param>
        /// <exception cref="LinkedNoteNotFoundException">At least one of the notes to link does not exist</exception>
        Task AddLinksAsync(Guid noteId, IEnumerable<Guid> linkedNoteIds, CancellationToken cancellationToken = default);
    }
}
