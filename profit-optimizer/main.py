from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import OptimizeRequest, OptimizeResponse
from calculator import calculate_net_proceeds
from recommendations import classify_opportunity, generate_recommendations

app = FastAPI(title="Smart Harvest & Profit Optimizer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/optimize", response_model=OptimizeResponse)
def optimize_profit(req: OptimizeRequest):
    # 1. Financial calculations
    calc_result = calculate_net_proceeds(
        quantity=req.quantity,
        unit=req.unit,
        price_per_quintal=req.pricePerQuintal,
        transport_cost=req.transportCost,
        loading_cost=req.loadingCost,
        labour_cost=req.labourCost,
        packaging_cost=req.packagingCost,
        other_costs=req.otherCosts,
        percentage_charges=req.percentageCharges / 100.0,
        production_cost=req.productionCost
    )

    profit = calc_result['profit']
    gross_value = calc_result['grossValue']

    # 2. Opportunity classification
    category, margin, reason, missing_costs = classify_opportunity(profit, gross_value)

    # 3. Recommendations & Comparisons
    recs, comparisons = generate_recommendations(req, calc_result)

    return OptimizeResponse(
        grossValue=calc_result['grossValue'],
        totalSellingExpenses=calc_result['totalSellingExpenses'],
        netProceeds=calc_result['netProceeds'],
        profit=calc_result['profit'],
        breakEvenTotal=calc_result['breakEvenTotal'],
        category=category,
        margin=margin,
        reason=reason,
        missingCosts=missing_costs,
        recommendations=recs,
        comparisons=comparisons
    )
