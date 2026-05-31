namespace BudgetApp.Application.DTOs;

public class UserResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public bool IsOnboarded { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateUserRequest
{
    public string? Currency { get; set; }
    public bool? IsOnboarded { get; set; }
}
