using BudgetApp.Application.DTOs;
using BudgetApp.Domain.Entities;
using BudgetApp.Domain.Interfaces;
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

    [HttpPost]
    public async Task<IActionResult> Create(CreateCategoryRequest request)
    {
        var category = new Category
        {
            Name = request.Name.Trim(),
            UserId = UserId,
            IsDefault = false,
        };

        await _categoryRepo.CreateAsync(category);

        return StatusCode(201, new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            IsDefault = category.IsDefault,
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var category = await _categoryRepo.GetByIdAsync(id);

        if (category == null || category.IsDefault || category.UserId != UserId)
            return NotFound();

        await _categoryRepo.DeleteAsync(category);
        return NoContent();
    }
}
