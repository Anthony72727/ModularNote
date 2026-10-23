using Domain.Entities;

namespace Application.Notes.DTOs
{
    /// <summary>
    /// Data Transfer Object for a note
    /// </summary>
    public class NoteDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Convert a note entity into its DTO
        /// </summary>
        /// <param name="note">The note to convert</param>
        /// <returns>The DTO of the note</returns>
        public static NoteDto FromNote(Note note)
        {
            return new NoteDto
            {
                Id = note.Id,
                Title = note.Title,
                Description = note.Description,
                CreatedAt = note.CreatedAt
            };
        }
    }
}
