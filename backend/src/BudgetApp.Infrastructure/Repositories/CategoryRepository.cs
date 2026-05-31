using BudgetApp.Infrastructure.Data;
using BudgetApp.Domain.Entities;
using BudgetApp.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BudgetApp.Infrastructure.Repositories;

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

    public async Task<Category> CreateAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public Task DeleteAsync(Category category)
    {
        _context.Categories.Remove(category);
        return _context.SaveChangesAsync();
    }
}
