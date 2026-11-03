using Domain.Repositories;

namespace ModularNoteUnitTest.Application.Fakes
{
    /// <summary>
    /// Unit of work that runs the action and remembers whether it ended normally
    /// </summary>
    public class FakeUnitOfWork : IUnitOfWork
    {
        public int CommitCount { get; private set; }

        public async Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken = default)
        {
            await action(cancellationToken);
            CommitCount++;
        }
    }
}
