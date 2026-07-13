using StudentManagement.Application.DTOs.Instructor;

namespace StudentManagement.Application.Interfaces;

public interface IInstructorRatingService
{
    Task<InstructorRatingDto> RateAsync(string studentUserId, CreateInstructorRatingDto dto);
    Task<IReadOnlyList<InstructorToRateDto>> GetEligibleInstructorsAsync(string studentUserId);
    Task<IReadOnlyList<InstructorRatingDto>> GetRatingsForInstructorAsync(string instructorUserId);
    Task<decimal> GetAverageRatingAsync(long instructorSsn);
    Task<IReadOnlyList<InstructorRatingDto>> GetRatingsForInstructorBySsnAsync(long instructorSsn);
}
