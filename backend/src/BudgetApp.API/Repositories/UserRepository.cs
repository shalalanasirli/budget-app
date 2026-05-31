using BudgetApp.API.Data;
using BudgetApp.API.Models;
using BudgetApp.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BudgetApp.API.Repositories;

public class UserRepository(AppDbContext context) : IUserRepository
{
    public Task<User?> GetByIdAsync(Guid id) =>
        context.Users.FirstOrDefaultAsync(u => u.Id == id);

    public Task<User?> GetByEmailAsync(string email) =>
        context.Users.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<User> CreateAsync(User user)
    {
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    public Task UpdateAsync(User user)
    {
        context.Users.Update(user);
        return context.SaveChangesAsync();
    }
}
