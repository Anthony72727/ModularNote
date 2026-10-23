using Application.Common.Exceptions;
using Domain.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace ModularNoteAPI.ExceptionHandlers
{
    /// <summary>
    /// Translates the business exceptions (Domain and Application) into HTTP responses
    /// with a ProblemDetails body. Any other exception is left to the default handler (500).
    /// </summary>
    public class BusinessExceptionHandler : IExceptionHandler
    {
        private readonly IProblemDetailsService _problemDetailsService;

        /// <summary>
        /// Instantiate the handler
        /// </summary>
        /// <param name="problemDetailsService">Service that writes ProblemDetails responses, registered by AddProblemDetails</param>
        public BusinessExceptionHandler(IProblemDetailsService problemDetailsService)
        {
            _problemDetailsService = problemDetailsService;
        }

        /// <inheritdoc />
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            int? statusCode = exception switch
            {
                DomainValidationException => StatusCodes.Status400BadRequest,
                NotFoundException => StatusCodes.Status404NotFound,
                _ => null
            };

            if (statusCode is null)
            {
                return false;
            }

            httpContext.Response.StatusCode = statusCode.Value;
            return await _problemDetailsService.TryWriteAsync(new ProblemDetailsContext
            {
                HttpContext = httpContext,
                Exception = exception,
                ProblemDetails = new ProblemDetails
                {
                    Status = statusCode,
                    Detail = exception.Message
                }
            });
        }
    }
}
