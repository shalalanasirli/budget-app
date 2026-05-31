using BudgetApp.API.Models;

namespace BudgetApp.API.Repositories.Interfaces;

public interface IBudgetRepository
{
    Task<IEnumerable<Budget>> GetForUserAsync(Guid userId, int month, int year);
    Task<Budget?> GetByIdAsync(Guid id);
    Task<Budget> CreateAsync(Budget budget);
    Task UpdateAsync(Budget budget);
    Task DeleteAsync(Budget budget);
}
