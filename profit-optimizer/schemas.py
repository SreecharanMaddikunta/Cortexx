from pydantic import BaseModel
from typing import List, Optional

class MarketRecord(BaseModel):
    market: str
    district: str
    commodity: str
    modalPrice: float
    arrivalDate: Optional[str] = None
    priceDate: Optional[str] = None

class OptimizeRequest(BaseModel):
    commodity: str
    quantity: float
    unit: str
    marketName: str
    pricePerQuintal: float
    transportCost: float
    loadingCost: float
    labourCost: float
    packagingCost: float
    otherCosts: float
    percentageCharges: float  # e.g., 5.0 for 5%
    productionCost: float
    marketData: List[MarketRecord] = []

class Recommendation(BaseModel):
    id: str
    priority: int
    title: str
    explanation: str
    impact: Optional[str] = None
    limitation: Optional[str] = None

class MarketComparison(BaseModel):
    marketName: str
    modalPrice: float
    priceDate: str
    grossValue: float
    totalSellingExpenses: float
    netProceeds: float
    profit: Optional[float]
    difference: float
    isComplete: bool

class OptimizeResponse(BaseModel):
    grossValue: float
    totalSellingExpenses: float
    netProceeds: float
    profit: Optional[float]
    breakEvenTotal: Optional[float]
    category: str
    margin: Optional[float]
    reason: str
    missingCosts: bool
    recommendations: List[Recommendation]
    comparisons: List[MarketComparison]
