using Domain.Exceptions;

namespace Domain.Entities
{
    /// <summary>
    /// Represent an undirected link between two notes: the smallest id always comes first,
    /// so that "A linked to B" and "B linked to A" are the same link
    /// </summary>
    public class NoteLink
    {
        /// <summary>
        /// Constructor used by EF Core to materialize a link from the database
        /// </summary>
        private NoteLink()
        {
        }

        /// <summary>
        /// get the link's ID
        /// </summary>
        public Guid Id { get; private set; }

        /// <summary>
        /// get the id of the first note of the link (the smallest one)
        /// </summary>
        public Guid NoteAId { get; private set; }

        /// <summary>
        /// get the id of the second note of the link (the largest one)
        /// </summary>
        public Guid NoteBId { get; private set; }

        /// <summary>
        /// Create a new valid link between two notes, in any order
        /// </summary>
        /// <param name="firstNoteId">The id of one of the notes</param>
        /// <param name="secondNoteId">The id of the other note</param>
        /// <exception cref="NoteLinkInvalidException">The two ids are the same</exception>
        public static NoteLink Create(Guid firstNoteId, Guid secondNoteId)
        {
            if (firstNoteId == secondNoteId)
            {
                throw new NoteLinkInvalidException();
            }

            bool isInOrder = firstNoteId.CompareTo(secondNoteId) < 0;
            return new NoteLink
            {
                Id = Guid.CreateVersion7(),
                NoteAId = isInOrder ? firstNoteId : secondNoteId,
                NoteBId = isInOrder ? secondNoteId : firstNoteId
            };
        }
    }
}
