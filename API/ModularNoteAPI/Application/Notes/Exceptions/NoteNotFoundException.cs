using Application.Common.Exceptions;

namespace Application.Notes.Exceptions
{
    /// <summary>
    /// The exception that is thrown when a note is not found
    /// </summary>
    public class NoteNotFoundException : NotFoundException
    {
        public NoteNotFoundException()
            : base("The note was not found.")
        {
        }
    }
}
