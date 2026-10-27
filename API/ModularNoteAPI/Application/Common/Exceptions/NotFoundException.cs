namespace Application.Common.Exceptions
{
    /// <summary>
    /// Base class of the exceptions thrown when a requested resource does not exist.
    /// The API translates them into a 404 Not Found.
    /// </summary>
    public abstract class NotFoundException : Exception
    {
        protected NotFoundException(string message)
            : base(message)
        {
        }
    }
}
