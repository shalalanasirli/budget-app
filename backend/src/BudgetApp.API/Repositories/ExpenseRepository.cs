using BudgetApp.API.Data;
using BudgetApp.API.Models;
using BudgetApp.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BudgetApp.API.Repositories;

public class ExpenseRepository(AppDbContext context) : IExpenseRepository
{
    public async Task<IEnumerable<Expense>> GetForUserAsync(Guid userId, Guid? categoryId, int? month, int? year)
    {
        var query = context.Expenses
                           .Include(e => e.Category)
                           .Where(e => e.UserId == userId);

        if (categoryId.HasValue)
            query = query.Where(e => e.CategoryId == categoryId.Value);

        if (month.HasValue)
            query = query.Where(e => e.Date.Month == month.Value);

        if (year.HasValue)
            query = query.Where(e => e.Date.Year == year.Value);

        return await query.OrderByDescending(e => e.Date).ToListAsync();
    }

    public Task<Expense?> GetByIdAsync(Guid id, Guid userId) =>
        context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

    public async Task<Expense> CreateAsync(Expense expense)
    {
        context.Expenses.Add(expense);
        await context.SaveChangesAsync();
        return expense;
    }

    public Task DeleteAsync(Expense expense)
    {
        context.Expenses.Remove(expense);
        return context.SaveChangesAsync();
    }
}
