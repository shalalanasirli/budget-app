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

    public ExpensesController(IExpenseRepository expenseRepo)
    {
        _expenseRepo = expenseRepo;
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
        var expense = new Expense
        {
            UserId = UserId,
            CategoryId = request.CategoryId,
            Amount = request.Amount,
            Merchant = request.Merchant,
            Description = request.Description,
            Date = request.Date,
        };

        await _expenseRepo.CreateAsync(expense);
        return StatusCode(201);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var expense = await _expenseRepo.GetByIdAsync(id, UserId);
        if (expense == null) return NotFound();

        await _expenseRepo.DeleteAsync(expense);
        return NoContent();
    }
}
