using BudgetApp.Domain.Entities;

namespace BudgetApp.Domain.Interfaces;

public interface IWalletRepository
{
    Task<IEnumerable<Wallet>> GetAllForUserAsync(Guid userId);
    Task<Wallet?> GetByIdAsync(Guid id, Guid userId);
    Task<Wallet> CreateAsync(Wallet wallet);
    Task SaveAsync();
    Task DeleteAsync(Wallet wallet);
}
