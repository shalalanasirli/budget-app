using BudgetApp.Domain.Entities;

namespace BudgetApp.Infrastructure.Data;

public static class DefaultCategories
{
    public static readonly Guid GroceriesId     = Guid.Parse("00000000-0000-0000-0000-000000000001");
    public static readonly Guid TransportId     = Guid.Parse("00000000-0000-0000-0000-000000000002");
    public static readonly Guid EntertainmentId = Guid.Parse("00000000-0000-0000-0000-000000000003");
    public static readonly Guid HousingId       = Guid.Parse("00000000-0000-0000-0000-000000000004");
    public static readonly Guid OtherId         = Guid.Parse("00000000-0000-0000-0000-000000000005");

    public static readonly Category[] All =
    [
        new Category { Id = GroceriesId,     Name = "Groceries",     IsDefault = true },
        new Category { Id = TransportId,     Name = "Transport",     IsDefault = true },
        new Category { Id = EntertainmentId, Name = "Entertainment", IsDefault = true },
        new Category { Id = HousingId,       Name = "Housing",       IsDefault = true },
        new Category { Id = OtherId,         Name = "Other",         IsDefault = true },
    ];
}
