using Domain.Entities;
using Domain.Exceptions;

namespace ModularNoteUnitTest.Domain
{
    public class NoteTests
    {
        [Fact]
        public void Create_WithValidValues_CreatesNote()
        {
            var note = Note.Create("  Idée  ", "Description");

            Assert.NotEqual(Guid.Empty, note.Id);
            Assert.Equal("Idée", note.Title);
            Assert.Equal("Description", note.Description);
            Assert.Null(note.UpdatedAt);
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData(null)]
        public void Create_WithEmptyTitle_Throws(string? title)
        {
            Assert.Throws<TitleInvalidException>(() => Note.Create(title!, null));
        }

        [Fact]
        public void Create_TitleLengthLimit()
        {
            Note.Create(new string('a', Note.TitleMaxLength), null);

            Assert.Throws<TitleInvalidException>(() => Note.Create(new string('a', Note.TitleMaxLength + 1), null));
        }

        [Fact]
        public void Create_DescriptionLengthLimit()
        {
            Note.Create("Titre", new string('a', Note.DescriptionMaxLength));

            Assert.Throws<DescriptionInvalidException>(() => Note.Create("Titre", new string('a', Note.DescriptionMaxLength + 1)));
        }

        [Fact]
        public void Create_WithBlankDescription_StoresNull()
        {
            var note = Note.Create("Titre", "   ");

            Assert.Null(note.Description);
        }

        [Fact]
        public void Update_WithValidValues_UpdatesNote()
        {
            var note = Note.Create("Titre", null);

            note.Update("Nouveau titre", "Nouvelle description");

            Assert.Equal("Nouveau titre", note.Title);
            Assert.Equal("Nouvelle description", note.Description);
            Assert.NotNull(note.UpdatedAt);
        }

        [Fact]
        public void Update_WithInvalidDescription_LeavesNoteUnchanged()
        {
            var note = Note.Create("Titre", "Description");

            Assert.Throws<DescriptionInvalidException>(() => note.Update("Autre titre", new string('a', Note.DescriptionMaxLength + 1)));

            Assert.Equal("Titre", note.Title);
            Assert.Equal("Description", note.Description);
            Assert.Null(note.UpdatedAt);
        }
    }
}
