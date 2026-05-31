using BudgetApp.Application.DTOs;
using BudgetApp.Domain.Entities;
using BudgetApp.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetApp.API.Controllers;

[Authorize]
public class WalletsController : BaseController
{
    private readonly IWalletRepository _walletRepo;
    private readonly IUserRepository _userRepo;

    public WalletsController(IWalletRepository walletRepo, IUserRepository userRepo)
    {
        _walletRepo = walletRepo;
        _userRepo = userRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var wallets = await _walletRepo.GetAllForUserAsync(UserId);

        return Ok(wallets.Select(ToResponse));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateWalletRequest request)
    {
        var user = await _userRepo.GetByIdAsync(UserId);
        if (user == null) return NotFound();

        var wallet = new Wallet
        {
            UserId = UserId,
            Name = request.Name.Trim(),
            Balance = request.Balance,
            Currency = request.Currency ?? user.Currency,
        };

        await _walletRepo.CreateAsync(wallet);
        return StatusCode(201, ToResponse(wallet));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateWalletRequest request)
    {
        var wallet = await _walletRepo.GetByIdAsync(id, UserId);
        if (wallet == null) return NotFound();

        if (!string.IsNullOrWhiteSpace(request.Name))
            wallet.Name = request.Name.Trim();

        if (request.Balance.HasValue)
            wallet.Balance = request.Balance.Value;

        await _walletRepo.SaveAsync();
        return Ok(ToResponse(wallet));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var wallet = await _walletRepo.GetByIdAsync(id, UserId);
        if (wallet == null) return NotFound();

        await _walletRepo.DeleteAsync(wallet);
        return NoContent();
    }

    private static WalletResponse ToResponse(Wallet w) => new()
    {
        Id = w.Id,
        Name = w.Name,
        Balance = w.Balance,
        Currency = w.Currency,
        CreatedAt = w.CreatedAt,
    };
}
