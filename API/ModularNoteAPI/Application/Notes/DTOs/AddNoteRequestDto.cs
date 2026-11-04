namespace Application.Notes.DTOs
{
    /// <summary>
    /// Data required to add a note
    /// </summary>
    public class AddNoteRequestDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        /// <summary>
        /// The ids of the existing notes to link to the new note, null or empty when there is none
        /// </summary>
        public List<Guid>? LinkedNoteIds { get; set; }
    }
}
