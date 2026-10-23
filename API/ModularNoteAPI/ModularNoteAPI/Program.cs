using Application.Notes.Abstractions.UseCases;
using Application.Notes.UseCases;
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

WebApplication app = builder.Build();

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
