using BudgetApp.Domain.Entities;

namespace BudgetApp.Domain.Interfaces;

public interface IExpenseRepository
{
    Task<IEnumerable<Expense>> GetForUserAsync(Guid userId, Guid? categoryId, int? month, int? year);
    Task<Expense?> GetByIdAsync(Guid id, Guid userId);
    Task<Expense> CreateAsync(Expense expense);
    Task DeleteAsync(Expense expense);
}
