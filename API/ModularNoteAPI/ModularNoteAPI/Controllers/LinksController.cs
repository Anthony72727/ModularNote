using Application.Links.Abstractions.UseCases;
using Application.Links.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ModularNoteAPI.Controllers
{
    /// <summary>
    /// Controller that handles the HTTP requests on the links between notes (/api/links)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class LinksController : ControllerBase
    {
        private readonly IGetLinksUseCase _getLinksUseCase;

        /// <summary>
        /// Instantiate the controller
        /// </summary>
        /// <param name="getLinksUseCase">Use case that gets every link</param>
        public LinksController(IGetLinksUseCase getLinksUseCase)
        {
            _getLinksUseCase = getLinksUseCase;
        }

        /// <summary>
        /// GET /api/links : get every link between the notes
        /// </summary>
        /// <param name="cancellationToken">Token to cancel the asynchronous operation</param>
        /// <returns>The list of links</returns>
        [HttpGet]
        [EndpointSummary("Get all links")]
        [EndpointDescription("Get every link between the notes in the database")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<GetLinksResponseDto>> GetLinks(CancellationToken cancellationToken)
        {
            GetLinksResponseDto response = await _getLinksUseCase.ExecuteAsync(cancellationToken);
            return Ok(response);
        }
    }
}
