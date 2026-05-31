using System.ComponentModel.DataAnnotations;

namespace BudgetApp.Application.DTOs;

public class WalletResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateWalletRequest
{
    [Required, MinLength(1), MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [Required, Range(0, double.MaxValue)]
    public decimal Balance { get; set; }

    public string? Currency { get; set; }
}

public class UpdateWalletRequest
{
    [MinLength(1), MaxLength(50)]
    public string? Name { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? Balance { get; set; }
}
