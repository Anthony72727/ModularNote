namespace Domain.Exceptions
{
    /// <summary>
    /// Represents an exception that occurs when a note is linked to itself.
    /// </summary>
    public class NoteLinkInvalidException : DomainValidationException
    {
        public NoteLinkInvalidException()
            : base("A note cannot be linked to itself.")
        {
        }
    }
}
