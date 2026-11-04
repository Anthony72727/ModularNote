using Application.Common.Exceptions;

namespace Application.Links.Exceptions
{
    /// <summary>
    /// The exception that is thrown when a note to link does not exist
    /// </summary>
    public class LinkedNoteNotFoundException : NotFoundException
    {
        /// <summary>
        /// Instantiate the exception
        /// </summary>
        /// <param name="missingNoteIds">The ids of the notes that do not exist, named in the message</param>
        public LinkedNoteNotFoundException(IEnumerable<Guid> missingNoteIds)
            : base($"These linked notes were not found: {string.Join(", ", missingNoteIds)}.")
        {
        }
    }
}
