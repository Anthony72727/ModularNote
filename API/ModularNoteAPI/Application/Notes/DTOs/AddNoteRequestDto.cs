namespace Application.Notes.DTOs
{
    /// <summary>
    /// Data required to add a note
    /// </summary>
    public class AddNoteRequestDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
