using System.ComponentModel.DataAnnotations;

namespace BudgetApp.Application.DTOs;

public class CreateBudgetRequest
{
    [Required]
    public Guid CategoryId { get; set; }

    [Required, Range(0.01, double.MaxValue)]
    public decimal MonthlyLimit { get; set; }

    [Required, Range(1, 12)]
    public int Month { get; set; }

    [Required, Range(2000, 9999)]
    public int Year { get; set; }
}

public class UpdateBudgetRequest
{
    [Required, Range(0.01, double.MaxValue)]
    public decimal MonthlyLimit { get; set; }
}

public class BudgetSummaryResponse
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal MonthlyLimit { get; set; }
    public decimal Spent { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
}
