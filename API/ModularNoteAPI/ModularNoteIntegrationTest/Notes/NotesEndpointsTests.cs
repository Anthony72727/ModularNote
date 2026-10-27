using System.Net;
using System.Net.Http.Json;
using System.Text;
using Application.Notes.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ModularNoteIntegrationTest.Notes;

public class NotesEndpointsTests : IClassFixture<ModularNoteApiFactory>
{
    private const string NotesUrl = "/api/notes";

    private readonly HttpClient _client;

    public NotesEndpointsTests(ModularNoteApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ---------- POST /api/notes ----------

    [Fact]
    public async Task AddNote_ValidNote_Returns201WithTheNote()
    {
        var response = await _client.PostAsJsonAsync(NotesUrl, new { title = "Idée", description = "Description" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var note = await response.Content.ReadFromJsonAsync<NoteDto>();
        Assert.NotNull(note);
        Assert.NotEqual(Guid.Empty, note.Id);
        Assert.Equal("Idée", note.Title);
        Assert.Equal("Description", note.Description);
        Assert.True(note.CreatedAt > DateTime.UtcNow.AddMinutes(-1));
    }

    [Fact]
    public async Task AddNote_ValidNote_ReturnsLowercaseLocationOfTheNote()
    {
        var response = await _client.PostAsJsonAsync(NotesUrl, new { title = "Idée" });

        var note = await response.Content.ReadFromJsonAsync<NoteDto>();
        Assert.NotNull(response.Headers.Location);
        Assert.Equal($"/api/notes/{note!.Id}", response.Headers.Location.AbsolutePath);
    }

    [Fact]
    public async Task AddNote_ValidNote_IsPersisted()
    {
        var response = await _client.PostAsJsonAsync(NotesUrl, new { title = "Idée persistée", description = "Description" });
        var created = await response.Content.ReadFromJsonAsync<NoteDto>();

        var saved = await _client.GetFromJsonAsync<NoteDto>(response.Headers.Location);

        Assert.NotNull(saved);
        Assert.Equal(created!.Id, saved.Id);
        Assert.Equal("Idée persistée", saved.Title);
        Assert.Equal("Description", saved.Description);
    }

    [Fact]
    public async Task AddNote_TitleWithSpaces_IsTrimmed()
    {
        var response = await _client.PostAsJsonAsync(NotesUrl, new { title = "   Idée   " });

        var note = await response.Content.ReadFromJsonAsync<NoteDto>();
        Assert.Equal("Idée", note!.Title);
    }

    [Fact]
    public async Task AddNote_WithoutDescription_Returns201WithNullDescription()
    {
        var response = await _client.PostAsJsonAsync(NotesUrl, new { title = "Idée" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var note = await response.Content.ReadFromJsonAsync<NoteDto>();
        Assert.Null(note!.Description);
    }

    [Fact]
    public async Task AddNote_MaxLengths_Returns201()
    {
        var response = await _client.PostAsJsonAsync(NotesUrl, new { title = new string('a', 100), description = new string('b', 5000) });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task AddNote_EmptyTitle_Returns400ProblemDetails(string title)
    {
        var response = await _client.PostAsJsonAsync(NotesUrl, new { title });

        await AssertProblemDetailsAsync(response, HttpStatusCode.BadRequest, "Title must be non-empty and less than or equal to 100 characters.");
    }

    [Fact]
    public async Task AddNote_TitleTooLong_Returns400ProblemDetails()
    {
        var response = await _client.PostAsJsonAsync(NotesUrl, new { title = new string('a', 101) });

        await AssertProblemDetailsAsync(response, HttpStatusCode.BadRequest, "Title must be non-empty and less than or equal to 100 characters.");
    }

    [Fact]
    public async Task AddNote_DescriptionTooLong_Returns400ProblemDetails()
    {
        var response = await _client.PostAsJsonAsync(NotesUrl, new { title = "Idée", description = new string('b', 5001) });

        await AssertProblemDetailsAsync(response, HttpStatusCode.BadRequest, "Description must be less than or equal to 5000 characters.");
    }

    [Fact]
    public async Task AddNote_InvalidNote_IsNotPersisted()
    {
        var title = $"Trop longue {Guid.NewGuid()}";
        await _client.PostAsJsonAsync(NotesUrl, new { title, description = new string('b', 5001) });

        var notes = await _client.GetFromJsonAsync<GetNotesResponseDto>(NotesUrl);

        Assert.DoesNotContain(notes!.Notes, note => note.Title == title);
    }

    [Fact]
    public async Task AddNote_MalformedJson_Returns400()
    {
        var content = new StringContent("{ \"title\": ", Encoding.UTF8, "application/json");

        var response = await _client.PostAsync(NotesUrl, content);

        // Automatic [ApiController] 400: ValidationProblemDetails body, but served as application/json
        // because of [Produces("application/json")] on the controller
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.NotNull(problem);
        Assert.Equal(400, problem.Status);
        Assert.NotEmpty(problem.Errors);
    }

    // ---------- GET /api/notes ----------

    [Fact]
    public async Task GetNotes_EmptyDatabase_Returns200WithEmptyList()
    {
        // Own factory: the class fixture database is filled by the other tests
        using var factory = new ModularNoteApiFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync(NotesUrl);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var notes = await response.Content.ReadFromJsonAsync<GetNotesResponseDto>();
        Assert.Empty(notes!.Notes);
    }

    [Fact]
    public async Task GetNotes_ReturnsTheAddedNotesInCreationOrder()
    {
        using var factory = new ModularNoteApiFactory();
        using var client = factory.CreateClient();
        var first = await AddNoteAsync(client, "Première");
        var second = await AddNoteAsync(client, "Seconde");

        var response = await client.GetAsync(NotesUrl);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var notes = await response.Content.ReadFromJsonAsync<GetNotesResponseDto>();
        Assert.Equal(new[] { first.Id, second.Id }, notes!.Notes.Select(note => note.Id));
        Assert.Equal(new[] { "Première", "Seconde" }, notes.Notes.Select(note => note.Title));
    }

    // ---------- GET /api/notes/{id} ----------

    [Fact]
    public async Task GetNoteById_ExistingNote_Returns200WithTheNote()
    {
        var created = await AddNoteAsync(_client, "Idée", "Description");

        var response = await _client.GetAsync($"{NotesUrl}/{created.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var note = await response.Content.ReadFromJsonAsync<NoteDto>();
        Assert.Equal(created.Id, note!.Id);
        Assert.Equal("Idée", note.Title);
        Assert.Equal("Description", note.Description);
        Assert.Equal(created.CreatedAt, note.CreatedAt);
    }

    [Fact]
    public async Task GetNoteById_UppercaseId_Returns200()
    {
        var created = await AddNoteAsync(_client, "Idée");

        var response = await _client.GetAsync($"/API/Notes/{created.Id.ToString().ToUpperInvariant()}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetNoteById_UnknownId_Returns404ProblemDetails()
    {
        var response = await _client.GetAsync($"{NotesUrl}/{Guid.NewGuid()}");

        await AssertProblemDetailsAsync(response, HttpStatusCode.NotFound, "The note was not found.");
    }

    [Fact]
    public async Task GetNoteById_IdIsNotAGuid_Returns404()
    {
        var response = await _client.GetAsync($"{NotesUrl}/not-a-guid");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ---------- Helpers ----------

    private static async Task<NoteDto> AddNoteAsync(HttpClient client, string title, string? description = null)
    {
        var response = await client.PostAsJsonAsync(NotesUrl, new { title, description });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<NoteDto>())!;
    }

    private static async Task AssertProblemDetailsAsync(HttpResponseMessage response, HttpStatusCode expectedStatus, string expectedDetail)
    {
        Assert.Equal(expectedStatus, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.NotNull(problem);
        Assert.Equal((int)expectedStatus, problem.Status);
        Assert.Equal(expectedDetail, problem.Detail);
    }
}
