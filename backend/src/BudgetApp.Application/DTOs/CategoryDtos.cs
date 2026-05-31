using System.ComponentModel.DataAnnotations;

namespace BudgetApp.Application.DTOs;

public class CategoryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}

public class CreateCategoryRequest
{
    [Required, MinLength(1), MaxLength(50)]
    public string Name { get; set; } = string.Empty;
}
