import pytest
from calculator import convert_to_quintals, calculate_net_proceeds
from recommendations import classify_opportunity, generate_recommendations
from schemas import OptimizeRequest, MarketRecord

def test_quantity_conversion():
    assert convert_to_quintals(10, 'quintal') == 10
    assert convert_to_quintals(10, 'kilogram') == 0.1
    assert convert_to_quintals(1, 'tonne') == 10
    assert convert_to_quintals(-5, 'quintal') == 0

def test_financial_calculations():
    # Quantity = 10 quintals
    # Price = ₹2,350 per quintal
    # Transportation = ₹500
    # Loading/unloading = ₹100
    # Labour = ₹200
    # Commission = 0%
    # Cultivation cost = ₹5,000

    res = calculate_net_proceeds(
        quantity=10,
        unit='quintal',
        price_per_quintal=2350,
        transport_cost=500,
        loading_cost=100,
        labour_cost=200,
        packaging_cost=0,
        other_costs=0,
        percentage_charges=0,
        production_cost=5000
    )

    assert res['grossValue'] == 23500.0
    assert res['totalSellingExpenses'] == 800.0
    assert res['netProceeds'] == 22700.0
    assert res['profit'] == 17700.0

def test_opportunity_classification():
    cat, margin, reason, missing = classify_opportunity(profit=17700, gross_value=23500)
    assert margin > 70
    assert cat == "Good Margin"

def test_missing_cultivation_cost():
    res = calculate_net_proceeds(
        quantity=10, unit='quintal', price_per_quintal=2350,
        transport_cost=500, loading_cost=100, labour_cost=200, percentage_charges=0,
        production_cost=0
    )
    
    assert res['grossValue'] == 23500.0
    assert res['profit'] is None
    
    cat, margin, reason, missing = classify_opportunity(res['profit'], res['grossValue'])
    assert cat == "Insufficient Data"
    assert missing == True

def test_generate_recommendations():
    req = OptimizeRequest(
        commodity='Tomato',
        quantity=10,
        unit='quintal',
        marketName='Local Market',
        pricePerQuintal=2350,
        transportCost=500,
        loadingCost=100,
        labourCost=200,
        packagingCost=0,
        otherCosts=0,
        percentageCharges=0,
        productionCost=5000,
        marketData=[
            MarketRecord(market='Better Market', district='Dist', commodity='Tomato', modalPrice=3000)
        ]
    )
    
    res = calculate_net_proceeds(10, 'quintal', 2350, 500, 100, 200, 0, 0, 0, 5000)
    recs, comps = generate_recommendations(req, res)
    
    # Assert better market recommendation
    assert len(comps) == 1
    assert comps[0]['difference'] > 0
    assert any(r['id'] == 'better_mandi' for r in recs)

def test_no_llm_api_calls(monkeypatch):
    import sys
    assert 'google.generativeai' not in sys.modules
    assert 'openai' not in sys.modules

    test_financial_calculations() # Should pass without hitting external APIs
