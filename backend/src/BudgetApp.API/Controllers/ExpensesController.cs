using BudgetApp.Application.DTOs;
using BudgetApp.Domain.Entities;
using BudgetApp.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetApp.API.Controllers;

[Authorize]
public class ExpensesController : BaseController
{
    private readonly IExpenseRepository _expenseRepo;
    private readonly IWalletRepository _walletRepo;

    public ExpensesController(IExpenseRepository expenseRepo, IWalletRepository walletRepo)
    {
        _expenseRepo = expenseRepo;
        _walletRepo = walletRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? categoryId,
        [FromQuery] int? month,
        [FromQuery] int? year)
    {
        var expenses = await _expenseRepo.GetForUserAsync(UserId, categoryId, month, year);

        return Ok(expenses.Select(e => new ExpenseResponse
        {
            Id = e.Id,
            CategoryId = e.CategoryId,
            CategoryName = e.Category.Name,
            WalletId = e.WalletId,
            WalletName = e.Wallet.Name,
            Amount = e.Amount,
            Merchant = e.Merchant,
            Description = e.Description,
            Date = e.Date,
            ReceiptImageUrl = e.ReceiptImageUrl,
            CreatedAt = e.CreatedAt,
        }));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateExpenseRequest request)
    {
        var wallet = await _walletRepo.GetByIdAsync(request.WalletId, UserId);
        if (wallet == null)
            return BadRequest(new { message = "Wallet not found." });

        var expense = new Expense
        {
            UserId = UserId,
            CategoryId = request.CategoryId,
            Amount = request.Amount,
            Merchant = request.Merchant,
            Description = request.Description,
            Date = request.Date,
            WalletId = request.WalletId,
        };

        await _expenseRepo.CreateAsync(expense);

        wallet.Balance -= request.Amount;
        await _walletRepo.SaveAsync();

        return StatusCode(201);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var expense = await _expenseRepo.GetByIdAsync(id, UserId);
        if (expense == null) return NotFound();

        var wallet = await _walletRepo.GetByIdAsync(expense.WalletId, UserId);
        if (wallet != null)
        {
            wallet.Balance += expense.Amount;
            await _walletRepo.SaveAsync();
        }

        await _expenseRepo.DeleteAsync(expense);
        return NoContent();
    }
}
