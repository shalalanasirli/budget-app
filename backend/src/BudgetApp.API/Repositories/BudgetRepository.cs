using BudgetApp.API.Data;
using BudgetApp.API.Models;
using BudgetApp.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BudgetApp.API.Repositories;

public class BudgetRepository(AppDbContext context) : IBudgetRepository
{
    public async Task<IEnumerable<Budget>> GetForUserAsync(Guid userId, int month, int year) =>
        await context.Budgets
                     .Include(b => b.Category)
                     .Where(b => b.UserId == userId && b.Month == month && b.Year == year)
                     .ToListAsync();

    public Task<Budget?> GetByIdAsync(Guid id) =>
        context.Budgets.FirstOrDefaultAsync(b => b.Id == id);

    public async Task<Budget> CreateAsync(Budget budget)
    {
        context.Budgets.Add(budget);
        await context.SaveChangesAsync();
        return budget;
    }

    public Task UpdateAsync(Budget budget)
    {
        context.Budgets.Update(budget);
        return context.SaveChangesAsync();
    }

    public Task DeleteAsync(Budget budget)
    {
        context.Budgets.Remove(budget);
        return context.SaveChangesAsync();
    }
}
