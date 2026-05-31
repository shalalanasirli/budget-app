using BudgetApp.Domain.Entities;

namespace BudgetApp.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task SaveAsync();
    Task DeleteAsync(User user);
}
