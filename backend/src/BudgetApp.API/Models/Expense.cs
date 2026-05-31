namespace BudgetApp.API.Models;

public class Expense
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CategoryId { get; set; }
    public decimal Amount { get; set; }
    public string? Merchant { get; set; }
    public string? Description { get; set; }
    public DateOnly Date { get; set; }
    public string? ReceiptImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
