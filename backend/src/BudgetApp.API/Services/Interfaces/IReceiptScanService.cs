namespace BudgetApp.API.Services.Interfaces;

public interface IReceiptScanService
{
    Task<ReceiptScanResult> ScanAsync(Stream imageStream, string fileName);
}

public class ReceiptScanResult
{
    public string? Merchant { get; set; }
    public decimal? Amount { get; set; }
    public Guid? SuggestedCategoryId { get; set; }
}
