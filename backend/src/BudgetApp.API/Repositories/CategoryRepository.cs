using BudgetApp.API.Data;
using BudgetApp.API.Models;
using BudgetApp.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BudgetApp.API.Repositories;

public class CategoryRepository(AppDbContext context) : ICategoryRepository
{
    public Task<IEnumerable<Category>> GetAllForUserAsync(Guid userId) =>
        Task.FromResult<IEnumerable<Category>>(
            context.Categories
                   .Where(c => c.IsDefault || c.UserId == userId)
                   .AsEnumerable());

    public Task<Category?> GetByIdAsync(Guid id) =>
        context.Categories.FirstOrDefaultAsync(c => c.Id == id);
}
