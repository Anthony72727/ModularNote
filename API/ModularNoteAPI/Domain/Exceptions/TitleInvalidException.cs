namespace Domain.Exceptions
{
    /// <summary>
    /// Represents an exception that occurs when a note's title is invalid.
    /// </summary>
    public class TitleInvalidException : DomainValidationException
    {
        public TitleInvalidException()
            : base("Title must be non-empty and less than or equal to 100 characters.")
        {
        }
    }
}
