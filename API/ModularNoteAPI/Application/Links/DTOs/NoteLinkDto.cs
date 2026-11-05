using Domain.Entities;

namespace Application.Links.DTOs
{
    /// <summary>
    /// A link between two notes
    /// </summary>
    public class NoteLinkDto
    {
        /// <summary>
        /// The link's id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The id of the first note of the link
        /// </summary>
        public Guid NoteAId { get; set; }

        /// <summary>
        /// The id of the second note of the link
        /// </summary>
        public Guid NoteBId { get; set; }

        /// <summary>
        /// Convert a link entity into a DTO
        /// </summary>
        /// <param name="link">The link to convert</param>
        /// <returns>The DTO of the link</returns>
        public static NoteLinkDto FromNoteLink(NoteLink link)
        {
            return new NoteLinkDto
            {
                Id = link.Id,
                NoteAId = link.NoteAId,
                NoteBId = link.NoteBId
            };
        }
    }
}
