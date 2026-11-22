using System.Net;
using System.Net.Http.Json;
using Application.Links.DTOs;
using Application.Notes.DTOs;

namespace ModularNoteIntegrationTest.Links;

public class LinksEndpointsTests : IClassFixture<ModularNoteApiFactory>
{
    private const string NotesUrl = "/api/notes";
    private const string LinksUrl = "/api/links";

    private readonly HttpClient _client;

    public LinksEndpointsTests(ModularNoteApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetLinks_AfterAddingLinkedNotes_ReturnsTheLinkWithItsTwoNotes()
    {
        var first = await AddNoteAsync(new { title = "Première" });
        var second = await AddNoteAsync(new { title = "Seconde", linkedNoteIds = new[] { first.Id } });

        var response = await _client.GetAsync(LinksUrl);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<GetLinksResponseDto>();
        var link = Assert.Single(body!.Links, l => l.NoteAId == second.Id || l.NoteBId == second.Id);
        Assert.Contains(first.Id, new[] { link.NoteAId, link.NoteBId });
        Assert.NotEqual(Guid.Empty, link.Id);
    }

    [Fact]
    public async Task GetLinks_AfterDeletingALinkedNote_NoLongerReturnsItsLinks()
    {
        var first = await AddNoteAsync(new { title = "Gardée" });
        var second = await AddNoteAsync(new { title = "Supprimée", linkedNoteIds = new[] { first.Id } });

        await _client.DeleteAsync($"{NotesUrl}/{second.Id}");

        var body = await _client.GetFromJsonAsync<GetLinksResponseDto>(LinksUrl);
        Assert.DoesNotContain(body!.Links, l => l.NoteAId == second.Id || l.NoteBId == second.Id);
    }

    private async Task<NoteDto> AddNoteAsync(object note)
    {
        var response = await _client.PostAsJsonAsync(NotesUrl, note);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<NoteDto>())!;
    }
}
