using BudgetApp.Domain.Entities;

namespace BudgetApp.Domain.Interfaces;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllForUserAsync(Guid userId);
    Task<Category?> GetByIdAsync(Guid id);
    Task<Category> CreateAsync(Category category);
    Task DeleteAsync(Category category);
}
