def convert_to_quintals(quantity: float, unit: str) -> float:
    if quantity <= 0:
        return 0.0
    unit = unit.lower()
    if unit == 'kilogram':
        return quantity / 100.0
    elif unit == 'tonne' or unit == 'metric tonne':
        return quantity * 10.0
    else:
        # quintal is default
        return quantity

def calculate_net_proceeds(
    quantity: float,
    unit: str,
    price_per_quintal: float,
    transport_cost: float = 0,
    loading_cost: float = 0,
    labour_cost: float = 0,
    packaging_cost: float = 0,
    other_costs: float = 0,
    percentage_charges: float = 0, # Note: pass as 0.05 for 5%
    production_cost: float = 0
) -> dict:
    q_quintals = convert_to_quintals(quantity, unit)
    
    if q_quintals <= 0:
        return {
            "grossValue": 0,
            "totalSellingExpenses": 0,
            "netProceeds": 0,
            "profit": None,
            "breakEvenTotal": None
        }

    gross_value = q_quintals * price_per_quintal
    fixed_costs = transport_cost + loading_cost + labour_cost + packaging_cost + other_costs
    percentage_costs = gross_value * percentage_charges
    total_selling_expenses = fixed_costs + percentage_costs
    
    net_proceeds = gross_value - total_selling_expenses
    
    profit = net_proceeds - production_cost if production_cost > 0 else None
    
    if percentage_charges < 1:
        break_even_total = (fixed_costs + production_cost) / (q_quintals * (1 - percentage_charges))
    else:
        break_even_total = float('inf')

    return {
        "grossValue": gross_value,
        "fixedCosts": fixed_costs,
        "percentageCosts": percentage_costs,
        "totalSellingExpenses": total_selling_expenses,
        "netProceeds": net_proceeds,
        "profit": profit,
        "breakEvenTotal": break_even_total
    }
