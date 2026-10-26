using Application.Notes.Abstractions.UseCases;
using Application.Notes.UseCases;
using Infrastructure;
using ModularNoteAPI.ExceptionHandlers;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddRouting(options => options.LowercaseUrls = true);
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<BusinessExceptionHandler>();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Use cases
builder.Services.AddScoped<IAddNoteUseCase, AddNoteUseCase>();
builder.Services.AddScoped<IGetNotesUseCase, GetNotesUseCase>();
builder.Services.AddScoped<IGetNoteByIdUseCase, GetNoteByIdUseCase>();

// Infrastructure (database + repositories)
builder.Services.AddInfrastructure(builder.Configuration);

WebApplication app = builder.Build();

// Create / update the database schema at startup
app.Services.ApplyMigrations();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
