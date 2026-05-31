using BudgetApp.API.DTOs;
using BudgetApp.API.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetApp.API.Controllers;

[Authorize]
public class CategoriesController : BaseController
{
    private readonly ICategoryRepository _categoryRepo;

    public CategoriesController(ICategoryRepository categoryRepo)
    {
        _categoryRepo = categoryRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _categoryRepo.GetAllForUserAsync(UserId);

        return Ok(categories.Select(c => new CategoryResponse
        {
            Id = c.Id,
            Name = c.Name,
            IsDefault = c.IsDefault,
        }));
    }
}
