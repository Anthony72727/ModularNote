using Application.Notes.Abstractions.UseCases;
using Application.Notes.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ModularNoteAPI.Controllers
{
    /// <summary>
    /// Controller that handles the HTTP requests on the notes (/api/notes)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class NotesController : ControllerBase
    {
        private readonly IGetNotesUseCase _getNotesUseCase;
        private readonly IGetNoteByIdUseCase _getNoteByIdUseCase;
        private readonly IAddNoteUseCase _addNoteUseCase;

        /// <summary>
        /// Instantiate the controller
        /// </summary>
        /// <param name="getNotesUseCase">Use case that gets every note</param>
        /// <param name="getNoteByIdUseCase">Use case that gets a note by its id</param>
        /// <param name="addNoteUseCase">Use case that adds a note</param>
        public NotesController(IGetNotesUseCase getNotesUseCase, IGetNoteByIdUseCase getNoteByIdUseCase, IAddNoteUseCase addNoteUseCase)
        {
            _getNotesUseCase = getNotesUseCase;
            _getNoteByIdUseCase = getNoteByIdUseCase;
            _addNoteUseCase = addNoteUseCase;
        }

        /// <summary>
        /// GET /api/notes : get every note
        /// </summary>
        /// <param name="cancellationToken">Token to cancel the asynchronous operation</param>
        /// <returns>The list of notes</returns>
        [HttpGet]
        [EndpointSummary("Get all notes")]
        [EndpointDescription("Get all notes in the database")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<GetNotesResponseDto>> GetNotes(CancellationToken cancellationToken)
        {
            GetNotesResponseDto response = await _getNotesUseCase.ExecuteAsync(cancellationToken);
            return Ok(response);
        }

        /// <summary>
        /// GET /api/notes/{id} : get a note by its id
        /// </summary>
        /// <param name="id">The id of the note to retrieve</param>
        /// <param name="cancellationToken">Token to cancel the asynchronous operation</param>
        /// <returns>The note, or 404 if it does not exist</returns>
        [HttpGet("{id:guid}")]
        [EndpointSummary("Get a note by its id")]
        [EndpointDescription("Get a note in the database by its id")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<NoteDto>> GetNoteById(Guid id, CancellationToken cancellationToken)
        {
            NoteDto response = await _getNoteByIdUseCase.ExecuteAsync(id, cancellationToken);
            return Ok(response);
        }

        /// <summary>
        /// POST /api/notes : add a new note
        /// </summary>
        /// <param name="request">The note to add</param>
        /// <param name="cancellationToken">Token to cancel the asynchronous operation</param>
        /// <returns>The added note, with its URL in the Location header</returns>
        [HttpPost]
        [EndpointSummary("Add a new note")]
        [EndpointDescription("Add a new note to the database")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<NoteDto>> AddNote(AddNoteRequestDto request, CancellationToken cancellationToken)
        {
            NoteDto response = await _addNoteUseCase.ExecuteAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetNoteById), new { id = response.Id }, response);
        }
    }
}
