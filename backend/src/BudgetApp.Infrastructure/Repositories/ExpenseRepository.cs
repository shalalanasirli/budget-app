using BudgetApp.Infrastructure.Data;
using BudgetApp.Domain.Entities;
using BudgetApp.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BudgetApp.Infrastructure.Repositories;

public class ExpenseRepository : IExpenseRepository
{
    private readonly AppDbContext _context;

    public ExpenseRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Expense>> GetForUserAsync(Guid userId, Guid? categoryId, int? month, int? year)
    {
        var query = _context.Expenses
                            .Include(e => e.Category)
                            .Include(e => e.Wallet)
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
        _context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

    public async Task<Expense> CreateAsync(Expense expense)
    {
        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();
        return expense;
    }

    public Task SaveAsync() => _context.SaveChangesAsync();

    public Task DeleteAsync(Expense expense)
    {
        _context.Expenses.Remove(expense);
        return _context.SaveChangesAsync();
    }
}
