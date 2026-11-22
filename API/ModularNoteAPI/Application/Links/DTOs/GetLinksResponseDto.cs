namespace Application.Links.DTOs
{
    /// <summary>
    /// The response for the use case that gets all links
    /// </summary>
    public class GetLinksResponseDto
    {
        /// <summary>
        /// The list of links
        /// </summary>
        public List<NoteLinkDto> Links { get; set; } = new();
    }
}
