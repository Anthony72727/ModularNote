using Application.Links.UseCases;
using Domain.Entities;
using ModularNoteUnitTest.Application.Fakes;

namespace ModularNoteUnitTest.Application.Links
{
    public class GetLinksUseCaseTests
    {
        private readonly FakeNoteLinkRepository _linkRepository = new();
        private readonly GetLinksUseCase _useCase;

        public GetLinksUseCaseTests()
        {
            _useCase = new GetLinksUseCase(_linkRepository);
        }

        [Fact]
        public async Task ExecuteAsync_WithLinks_ReturnsEveryLink()
        {
            var link = NoteLink.Create(Guid.NewGuid(), Guid.NewGuid());
            _linkRepository.Links.Add(link);

            var result = await _useCase.ExecuteAsync();

            var dto = Assert.Single(result.Links);
            Assert.Equal(link.Id, dto.Id);
            Assert.Equal(link.NoteAId, dto.NoteAId);
            Assert.Equal(link.NoteBId, dto.NoteBId);
        }

        [Fact]
        public async Task ExecuteAsync_WithoutLink_ReturnsAnEmptyList()
        {
            var result = await _useCase.ExecuteAsync();

            Assert.Empty(result.Links);
        }
    }
}
