using BudgetApp.Application.DTOs;
using BudgetApp.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetApp.API.Controllers;

[Authorize]
public class UsersController : BaseController
{
    private readonly IUserRepository _userRepo;

    public UsersController(IUserRepository userRepo)
    {
        _userRepo = userRepo;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var user = await _userRepo.GetByIdAsync(UserId);
        if (user == null) return NotFound();

        return Ok(new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            Currency = user.Currency,
            IsOnboarded = user.IsOnboarded,
            CreatedAt = user.CreatedAt,
        });
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe(UpdateUserRequest request)
    {
        var user = await _userRepo.GetByIdAsync(UserId);
        if (user == null) return NotFound();

        if (!string.IsNullOrWhiteSpace(request.Currency))
            user.Currency = request.Currency;

        if (request.IsOnboarded.HasValue)
            user.IsOnboarded = request.IsOnboarded.Value;

        await _userRepo.UpdateAsync(user);

        return Ok(new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            Currency = user.Currency,
            IsOnboarded = user.IsOnboarded,
            CreatedAt = user.CreatedAt,
        });
    }
}
