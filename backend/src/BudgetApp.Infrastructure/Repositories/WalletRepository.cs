using BudgetApp.Domain.Entities;
using BudgetApp.Domain.Interfaces;
using BudgetApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BudgetApp.Infrastructure.Repositories;

public class WalletRepository : IWalletRepository
{
    private readonly AppDbContext _context;

    public WalletRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Wallet>> GetAllForUserAsync(Guid userId) =>
        await _context.Wallets
                      .Where(w => w.UserId == userId)
                      .OrderBy(w => w.CreatedAt)
                      .ToListAsync();

    public Task<Wallet?> GetByIdAsync(Guid id, Guid userId) =>
        _context.Wallets.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

    public async Task<Wallet> CreateAsync(Wallet wallet)
    {
        _context.Wallets.Add(wallet);
        await _context.SaveChangesAsync();
        return wallet;
    }

    public Task SaveAsync() => _context.SaveChangesAsync();

    public Task DeleteAsync(Wallet wallet)
    {
        _context.Wallets.Remove(wallet);
        return _context.SaveChangesAsync();
    }
}
