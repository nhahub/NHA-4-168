namespace StudentManagement.Domain.Exceptions;

public class ValidationException : ApiException
{
    public Dictionary<string, string[]>? Errors { get; set; }

    public ValidationException(string message, Dictionary<string, string[]>? errors = null)
        : base(message, 400, "VALIDATION_ERROR")
    {
        Errors = errors;
    }
}
