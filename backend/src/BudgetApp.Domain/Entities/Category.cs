namespace BudgetApp.Domain.Entities;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public Guid? UserId { get; set; }

    public User? User { get; set; }
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
