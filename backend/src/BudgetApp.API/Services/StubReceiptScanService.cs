using BudgetApp.API.Data;
using BudgetApp.API.Services.Interfaces;

namespace BudgetApp.API.Services;

public class StubReceiptScanService : IReceiptScanService
{
    public Task<ReceiptScanResult> ScanAsync(Stream imageStream, string fileName)
    {
        return Task.FromResult(new ReceiptScanResult
        {
            Merchant = null,
            Amount = null,
            SuggestedCategoryId = DefaultCategories.OtherId,
        });
    }
}
