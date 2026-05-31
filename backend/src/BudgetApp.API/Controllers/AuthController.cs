using BudgetApp.Application.DTOs;
using BudgetApp.Domain.Entities;
using BudgetApp.Domain.Interfaces;
using BudgetApp.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace BudgetApp.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepo;
    private readonly JwtService _jwtService;

    public AuthController(IUserRepository userRepo, JwtService jwtService)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (await _userRepo.GetByEmailAsync(request.Email.ToLower()) != null)
            return Conflict(new { message = "Email already registered." });

        var user = new User
        {
            Email = request.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
        };

        await _userRepo.CreateAsync(user);

        return Ok(new AuthResponse
        {
            Token = _jwtService.GenerateToken(user),
            UserId = user.Id,
            Email = user.Email,
            Currency = user.Currency,
            IsOnboarded = user.IsOnboarded,
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _userRepo.GetByEmailAsync(request.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials." });

        return Ok(new AuthResponse
        {
            Token = _jwtService.GenerateToken(user),
            UserId = user.Id,
            Email = user.Email,
            Currency = user.Currency,
            IsOnboarded = user.IsOnboarded,
        });
    }
}
