from datetime import datetime
from calculator import calculate_net_proceeds

def classify_opportunity(profit, gross_value):
    if profit is None:
        return "Insufficient Data", None, "Selling-cost-only assessment. Cultivation costs are missing, so actual profit margin cannot be determined.", True
    
    if gross_value <= 0:
        return "Insufficient Data", None, "Gross selling value is zero or invalid.", False

    margin = (profit / gross_value) * 100

    if margin >= 20:
        category = "Good Margin"
        reason = f"The estimated profit margin is {margin:.1f}%. This indicates a strong return on your investment based on the supplied costs."
    elif margin >= 10:
        category = "Moderate Margin"
        reason = f"The estimated profit margin is {margin:.1f}%. You are covering costs with a reasonable return."
    elif margin >= 0:
        category = "Low Margin"
        reason = f"The estimated profit margin is low ({margin:.1f}%). Consider comparing other markets or reducing expenses."
    else:
        category = "Potential Loss"
        reason = "The estimated profit is negative. Entered costs exceed estimated selling revenue."

    return category, margin, reason, False

def generate_recommendations(req, calc_result):
    gross_value = calc_result['grossValue']
    total_selling_expenses = calc_result['totalSellingExpenses']
    profit = calc_result['profit']
    break_even_total = calc_result['breakEvenTotal']
    
    has_production_cost = req.productionCost > 0
    margin = (profit / gross_value * 100) if has_production_cost and gross_value > 0 else None

    recs = []

    # Rule D: Potential Loss
    if has_production_cost and profit is not None and profit < 0:
        explanation = "Your estimated profit is negative. Costs exceed selling revenue."
        if break_even_total and break_even_total > 0 and break_even_total != float('inf'):
            explanation += f" You would need a selling price of ₹{break_even_total:.2f} per quintal to break even under current assumptions."
        recs.append({
            "id": "potential_loss",
            "priority": 1,
            "title": "Potential Financial Loss",
            "explanation": explanation,
            "impact": None,
            "limitation": None
        })

    # Rule E: Missing Cultivation Cost
    if not has_production_cost:
        recs.append({
            "id": "missing_cost",
            "priority": 1,
            "title": "Missing Cultivation Cost",
            "explanation": "The estimated net proceeds exclude cultivation costs. Please enter the relevant cultivation cost to obtain a complete profit estimate.",
            "impact": None,
            "limitation": None
        })

    # Rule A: High expenses
    if gross_value > 0 and (total_selling_expenses / gross_value) > 0.15:
        recs.append({
            "id": "high_expenses",
            "priority": 3,
            "title": "High Selling Expenses",
            "explanation": "Selling expenses account for a significant part of your gross value (>15%). Review transport quotes or market commission fees before deciding.",
            "impact": None,
            "limitation": None
        })

    # Rule C: Low Margin
    if margin is not None and 0 <= margin < 10:
        recs.append({
            "id": "low_margin",
            "priority": 4,
            "title": "Low Profit Margin",
            "explanation": "Your estimated profit margin is below 10%. Check for alternative markets, try to obtain updated transport quotes, or verify current market prices.",
            "impact": None,
            "limitation": None
        })

    # Market Comparisons (Rules B, G, F)
    comparisons = []
    selected_market_record = None

    if req.marketData:
        for market in req.marketData:
            # Stale price check (Rule F)
            market_full_name = f"{market.market}, {market.district}"
            if market_full_name == req.marketName or market.market == req.marketName:
                selected_market_record = market
                continue

            if market.commodity.lower() != req.commodity.lower():
                continue

            m_price = market.modalPrice
            if m_price > 0:
                alt_result = calculate_net_proceeds(
                    quantity=req.quantity,
                    unit=req.unit,
                    price_per_quintal=m_price,
                    transport_cost=req.transportCost,
                    loading_cost=req.loadingCost,
                    labour_cost=req.labourCost,
                    packaging_cost=req.packagingCost,
                    other_costs=req.otherCosts,
                    percentage_charges=req.percentageCharges / 100.0,
                    production_cost=req.productionCost
                )

                if has_production_cost:
                    diff = alt_result['profit'] - profit
                else:
                    diff = alt_result['netProceeds'] - calc_result['netProceeds']

                comparisons.append({
                    "marketName": market_full_name,
                    "modalPrice": m_price,
                    "priceDate": market.arrivalDate or market.priceDate or datetime.now().isoformat(),
                    "grossValue": alt_result['grossValue'],
                    "totalSellingExpenses": alt_result['totalSellingExpenses'],
                    "netProceeds": alt_result['netProceeds'],
                    "profit": alt_result['profit'],
                    "difference": diff,
                    "isComplete": False
                })

        comparisons.sort(key=lambda x: x['difference'], reverse=True)

        if comparisons:
            best_alternative = comparisons[0]
            if best_alternative['difference'] > 0:
                recs.append({
                    "id": "better_mandi",
                    "priority": 2,
                    "title": "Better Market Available",
                    "explanation": f"Selling at {best_alternative['marketName']} might yield higher net returns. {best_alternative['marketName']} price is ₹{best_alternative['modalPrice']}/qtl.",
                    "impact": f"+₹{best_alternative['difference']:.2f}",
                    "limitation": "Transportation cost to this market may differ and is currently assumed similar to your selected market."
                })
            else:
                similar_markets = [c for c in comparisons if abs(c['difference']) < 500]
                if similar_markets:
                    recs.append({
                        "id": "similar_mandi",
                        "priority": 5,
                        "title": "Similar Returns in Other Markets",
                        "explanation": "Other markets offer similar estimated net proceeds. Consider travel time, convenience, and data reliability.",
                        "impact": None,
                        "limitation": None
                    })

    # Rule F: Stale price on selected market
    if selected_market_record and selected_market_record.arrivalDate:
        parts = selected_market_record.arrivalDate.split('/')
        if len(parts) == 3:
            try:
                p_date = datetime(int(parts[2]), int(parts[1]), int(parts[0]))
                diff_days = (datetime.now() - p_date).days
                if diff_days > 7:
                    recs.append({
                        "id": "stale_price",
                        "priority": 1,
                        "title": "Outdated Market Price",
                        "explanation": f"The market price data used for this estimate is older than a week. ({selected_market_record.arrivalDate})",
                        "impact": None,
                        "limitation": None
                    })
            except Exception:
                pass

    recs.sort(key=lambda x: x['priority'])
    
    unique_recs = []
    seen = set()
    for r in recs:
        if r['id'] not in seen:
            seen.add(r['id'])
            unique_recs.append(r)

    return unique_recs, comparisons
