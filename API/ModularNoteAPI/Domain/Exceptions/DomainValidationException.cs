namespace Domain.Exceptions
{
    /// <summary>
    /// Base class of the exceptions thrown when a business rule of an entity is broken.
    /// The API translates them into a 400 Bad Request.
    /// </summary>
    public abstract class DomainValidationException : Exception
    {
        protected DomainValidationException(string message)
            : base(message)
        {
        }
    }
}
