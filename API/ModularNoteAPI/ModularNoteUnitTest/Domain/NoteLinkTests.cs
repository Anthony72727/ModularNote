using Domain.Entities;
using Domain.Exceptions;

namespace ModularNoteUnitTest.Domain
{
    public class NoteLinkTests
    {
        private static readonly Guid SmallestId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        private static readonly Guid LargestId = Guid.Parse("00000000-0000-0000-0000-000000000002");

        [Fact]
        public void Create_GivesTheLinkAnId()
        {
            var link = NoteLink.Create(SmallestId, LargestId);

            Assert.NotEqual(Guid.Empty, link.Id);
        }

        [Fact]
        public void Create_InAnyOrder_StoresTheSmallestIdFirst()
        {
            var inOrder = NoteLink.Create(SmallestId, LargestId);
            var reversed = NoteLink.Create(LargestId, SmallestId);

            Assert.Equal(SmallestId, inOrder.NoteAId);
            Assert.Equal(LargestId, inOrder.NoteBId);
            Assert.Equal(SmallestId, reversed.NoteAId);
            Assert.Equal(LargestId, reversed.NoteBId);
        }

        [Fact]
        public void Create_SameNoteTwice_Throws()
        {
            Assert.Throws<NoteLinkInvalidException>(() => NoteLink.Create(SmallestId, SmallestId));
        }
    }
}
