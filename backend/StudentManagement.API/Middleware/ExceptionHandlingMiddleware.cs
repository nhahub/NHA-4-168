using System.Text.Json;
using StudentManagement.Domain.Exceptions;

namespace StudentManagement.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception has occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new
        {
            success = false,
            message = exception.Message,
            errors = (object?)null,
            statusCode = 500
        };

        if (exception is ApiException apiException)
        {
            context.Response.StatusCode = apiException.StatusCode;
            response = new
            {
                success = false,
                message = apiException.Message,
                errors = (object?)(apiException is ValidationException valEx ? valEx.Errors : null),
                statusCode = apiException.StatusCode
            };
        }
        else
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        }

        return context.Response.WriteAsJsonAsync(response);
    }
}
