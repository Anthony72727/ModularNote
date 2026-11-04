namespace Domain.Repositories
{
    /// <summary>
    /// Groups several writes of the repositories into one transaction.
    /// </summary>
    public interface IUnitOfWork
    {
        /// <summary>
        /// Run an action in a transaction: everything is saved if it ends normally, nothing if it throws
        /// </summary>
        /// <param name="action">The writes to group, which receive the cancellation token</param>
        /// <param name="cancellationToken">The token to monitor for cancellation requests</param>
        Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken = default);
    }
}
