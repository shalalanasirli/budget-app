using System.ComponentModel.DataAnnotations;

namespace BudgetApp.Application.DTOs;

public class CreateExpenseRequest
{
    [Required]
    public Guid CategoryId { get; set; }

    [Required, Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    public string? Merchant { get; set; }
    public string? Description { get; set; }

    [Required]
    public DateOnly Date { get; set; }

    [Required]
    public Guid WalletId { get; set; }
}

public class ExpenseResponse
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public Guid WalletId { get; set; }
    public string WalletName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Merchant { get; set; }
    public string? Description { get; set; }
    public DateOnly Date { get; set; }
    public string? ReceiptImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
