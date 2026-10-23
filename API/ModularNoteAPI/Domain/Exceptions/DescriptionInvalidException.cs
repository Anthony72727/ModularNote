namespace Domain.Exceptions
{
    /// <summary>
    /// Represents an exception that occurs when a note's description is invalid.
    /// </summary>
    public class DescriptionInvalidException : DomainValidationException
    {
        public DescriptionInvalidException()
            : base("Description must be less than or equal to 5000 characters.")
        {
        }
    }
}
