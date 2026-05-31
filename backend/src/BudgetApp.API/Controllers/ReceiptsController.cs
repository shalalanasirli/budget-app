using BudgetApp.Application.DTOs;
using BudgetApp.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetApp.API.Controllers;

[Authorize]
public class ReceiptsController : BaseController
{
    private readonly IReceiptScanService _receiptScanService;

    public ReceiptsController(IReceiptScanService receiptScanService)
    {
        _receiptScanService = receiptScanService;
    }

    [HttpPost("scan")]
    public async Task<IActionResult> Scan(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        using var stream = file.OpenReadStream();
        var result = await _receiptScanService.ScanAsync(stream, file.FileName);

        return Ok(new ScanReceiptResponse
        {
            Merchant = result.Merchant,
            Amount = result.Amount,
            SuggestedCategoryId = result.SuggestedCategoryId,
        });
    }
}
