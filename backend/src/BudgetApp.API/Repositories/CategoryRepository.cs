using BudgetApp.API.Data;
using BudgetApp.API.Models;
using BudgetApp.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BudgetApp.API.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;

    public CategoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Category>> GetAllForUserAsync(Guid userId) =>
        await _context.Categories
                      .Where(c => c.IsDefault || c.UserId == userId)
                      .ToListAsync();

    public Task<Category?> GetByIdAsync(Guid id) =>
        _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
}
