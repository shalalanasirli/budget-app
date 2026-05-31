using BudgetApp.API.Data;
using BudgetApp.API.Models;
using BudgetApp.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BudgetApp.API.Repositories;

public class BudgetRepository : IBudgetRepository
{
    private readonly AppDbContext _context;

    public BudgetRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Budget>> GetForUserAsync(Guid userId, int month, int year) =>
        await _context.Budgets
                      .Include(b => b.Category)
                      .Where(b => b.UserId == userId && b.Month == month && b.Year == year)
                      .ToListAsync();

    public Task<Budget?> GetByIdAsync(Guid id) =>
        _context.Budgets.FirstOrDefaultAsync(b => b.Id == id);

    public async Task<Budget> CreateAsync(Budget budget)
    {
        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();
        return budget;
    }

    public Task UpdateAsync(Budget budget)
    {
        _context.Budgets.Update(budget);
        return _context.SaveChangesAsync();
    }

    public Task DeleteAsync(Budget budget)
    {
        _context.Budgets.Remove(budget);
        return _context.SaveChangesAsync();
    }
}
