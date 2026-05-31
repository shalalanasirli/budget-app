using BudgetApp.Infrastructure.Data;
using BudgetApp.Domain.Interfaces;

namespace BudgetApp.Infrastructure.Services;

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
