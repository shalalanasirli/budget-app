using BudgetApp.API.Models;

namespace BudgetApp.API.Repositories.Interfaces;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllForUserAsync(Guid userId);
    Task<Category?> GetByIdAsync(Guid id);
}
