namespace Application.Notes.DTOs
{
    /// <summary>
    /// Data required to update a note
    /// </summary>
    public class UpdateNoteRequestDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
