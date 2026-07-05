namespace StudentManagement.Domain.Exceptions;

public class ApiException : Exception
{
    public int StatusCode { get; set; }
    public string? ErrorCode { get; set; }

    public ApiException(string message, int statusCode = 500, string? errorCode = null)
        : base(message)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }
}
