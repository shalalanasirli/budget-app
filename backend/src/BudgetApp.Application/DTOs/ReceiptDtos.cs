namespace BudgetApp.Application.DTOs;

public class ScanReceiptResponse
{
    public string? Merchant { get; set; }
    public decimal? Amount { get; set; }
    public Guid? SuggestedCategoryId { get; set; }
}
