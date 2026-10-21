using Domain.Exceptions;

namespace Domain.Entities
{
    /// <summary>
    /// Represent an user's note
    /// </summary>
    public class Note
    {
        /// <summary>
        /// Maximum length of a note's title
        /// </summary>
        public const int TitleMaxLength = 100;

        /// <summary>
        /// Maximum length of a note's description
        /// </summary>
        public const int DescriptionMaxLength = 5000;

        /// <summary>
        /// Constructor used by EF Core to materialize a note from the database
        /// </summary>
        private Note()
        {
            Title = string.Empty;
        }

        /// <summary>
        /// get the note's ID
        /// </summary>
        public Guid Id { get; private set; }

        /// <summary>
        /// get the note's title
        /// </summary>
        public string Title { get; private set; }

        /// <summary>
        /// get the note's description
        /// </summary>
        public string? Description { get; private set; }

        /// <summary>
        /// get the note's creation date (UTC)
        /// </summary>
        public DateTime CreatedAt { get; private set; }

        /// <summary>
        /// get the note's last modification date (UTC), null if never modified
        /// </summary>
        public DateTime? UpdatedAt { get; private set; }

        /// <summary>
        /// Create a new valid note
        /// </summary>
        /// <param name="title">The note's title</param>
        /// <param name="description">The note's description</param>
        /// <exception cref="TitleInvalidException">The title is empty or too long</exception>
        /// <exception cref="DescriptionInvalidException">The description is too long</exception>
        public static Note Create(string title, string? description)
        {
            return new Note
            {
                Id = Guid.CreateVersion7(),
                Title = ValidateTitle(title),
                Description = ValidateDescription(description),
                CreatedAt = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Update the note's title and description
        /// </summary>
        /// <param name="title">The new title</param>
        /// <param name="description">The new description</param>
        /// <exception cref="TitleInvalidException">The title is empty or too long</exception>
        /// <exception cref="DescriptionInvalidException">The description is too long</exception>
        public void Update(string title, string? description)
        {
            string validTitle = ValidateTitle(title);
            string? validDescription = ValidateDescription(description);

            Title = validTitle;
            Description = validDescription;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Trim and validate a title
        /// </summary>
        /// <param name="title">The title to validate</param>
        /// <returns>The trimmed title</returns>
        /// <exception cref="TitleInvalidException">The title is empty or too long</exception>
        private static string ValidateTitle(string title)
        {
            string? trimmed = title?.Trim();
            if (string.IsNullOrEmpty(trimmed) || trimmed.Length > TitleMaxLength)
            {
                throw new TitleInvalidException();
            }
            return trimmed;
        }

        /// <summary>
        /// Validate a description
        /// </summary>
        /// <param name="description">The description to validate</param>
        /// <returns>The description, or null if it is empty</returns>
        /// <exception cref="DescriptionInvalidException">The description is too long</exception>
        private static string? ValidateDescription(string? description)
        {
            if (string.IsNullOrWhiteSpace(description))
            {
                return null;
            }
            if (description.Length > DescriptionMaxLength)
            {
                throw new DescriptionInvalidException();
            }
            return description;
        }
    }
}
