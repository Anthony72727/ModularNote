using System.Net;
using Microsoft.AspNetCore.Hosting;

namespace ModularNoteIntegrationTest;

public class ApiStartupTests : IClassFixture<ModularNoteApiFactory>
{
    private readonly ModularNoteApiFactory _factory;
    private readonly HttpClient _client;

    public ApiStartupTests(ModularNoteApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task OpenApiDocument_IsExposed_InDevelopment()
    {
        var response = await _client.GetAsync("/openapi/v1.json");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ScalarPage_IsExposed_InDevelopment()
    {
        var response = await _client.GetAsync("/scalar");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/html", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task ScalarPage_IsNotExposed_InProduction()
    {
        using var client = _factory.WithWebHostBuilder(builder => builder.UseEnvironment("Production")).CreateClient();

        var response = await client.GetAsync("/scalar");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public void Startup_CreatesTheTestDatabase()
    {
        Assert.True(File.Exists(_factory.DatabasePath));
    }

    [Fact]
    public async Task UnknownRoute_Returns404()
    {
        var response = await _client.GetAsync("/api/unknown");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
