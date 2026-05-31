using BudgetApp.Application.DTOs;
using BudgetApp.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetApp.API.Controllers;

[Authorize]
public class SettingsController : BaseController
{
    private readonly IUserRepository _userRepo;

    public SettingsController(IUserRepository userRepo)
    {
        _userRepo = userRepo;
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var user = await _userRepo.GetByIdAsync(UserId);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _userRepo.SaveAsync();

        return NoContent();
    }

    [HttpDelete("account")]
    public async Task<IActionResult> DeleteAccount()
    {
        var user = await _userRepo.GetByIdAsync(UserId);
        if (user == null) return NotFound();

        await _userRepo.DeleteAsync(user);
        return NoContent();
    }
}
