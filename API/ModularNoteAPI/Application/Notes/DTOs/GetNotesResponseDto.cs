namespace Application.Notes.DTOs
{
    /// <summary>
    /// The response for the use case that gets all notes
    /// </summary>
    public class GetNotesResponseDto
    {
        /// <summary>
        /// The list of notes
        /// </summary>
        public List<NoteDto> Notes { get; set; } = new();
    }
}
