using BudgetApp.API.DTOs;
using BudgetApp.API.Models;
using BudgetApp.API.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetApp.API.Controllers;

[Authorize]
public class BudgetsController : BaseController
{
    private readonly IBudgetRepository _budgetRepo;
    private readonly IExpenseRepository _expenseRepo;

    public BudgetsController(IBudgetRepository budgetRepo, IExpenseRepository expenseRepo)
    {
        _budgetRepo = budgetRepo;
        _expenseRepo = expenseRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? month, [FromQuery] int? year)
    {
        var m = month ?? DateTime.UtcNow.Month;
        var y = year ?? DateTime.UtcNow.Year;

        var budgets = await _budgetRepo.GetForUserAsync(UserId, m, y);
        var expenses = await _expenseRepo.GetForUserAsync(UserId, null, m, y);

        var spentByCategory = expenses
            .GroupBy(e => e.CategoryId)
            .ToDictionary(g => g.Key, g => g.Sum(e => e.Amount));

        return Ok(budgets.Select(b => new BudgetSummaryResponse
        {
            Id = b.Id,
            CategoryId = b.CategoryId,
            CategoryName = b.Category.Name,
            MonthlyLimit = b.MonthlyLimit,
            Spent = spentByCategory.GetValueOrDefault(b.CategoryId, 0),
            Month = b.Month,
            Year = b.Year,
        }));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateBudgetRequest request)
    {
        var budget = new Budget
        {
            UserId = UserId,
            CategoryId = request.CategoryId,
            MonthlyLimit = request.MonthlyLimit,
            Month = request.Month,
            Year = request.Year,
        };

        await _budgetRepo.CreateAsync(budget);
        return StatusCode(201);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateBudgetRequest request)
    {
        var budget = await _budgetRepo.GetByIdAsync(id);
        if (budget == null || budget.UserId != UserId) return NotFound();

        budget.MonthlyLimit = request.MonthlyLimit;
        await _budgetRepo.UpdateAsync(budget);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var budget = await _budgetRepo.GetByIdAsync(id);
        if (budget == null || budget.UserId != UserId) return NotFound();

        await _budgetRepo.DeleteAsync(budget);
        return NoContent();
    }
}
