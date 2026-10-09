import { describe, test, expect } from 'vitest';
import { convertToQuintals, calculateNetProceeds } from './calculator';

describe('Smart Selling Calculator', () => {
  test('convertToQuintals correctly converts from kilograms', () => {
    expect(convertToQuintals(150, 'kilogram')).toBe(1.5);
  });

  test('convertToQuintals correctly converts from tonnes', () => {
    expect(convertToQuintals(2, 'tonne')).toBe(20);
  });

  test('convertToQuintals handles zero and negative', () => {
    expect(convertToQuintals(0, 'quintal')).toBe(0);
    expect(convertToQuintals(-50, 'kilogram')).toBe(0);
  });

  test('calculateNetProceeds computes correct gross value and expenses', () => {
    const result = calculateNetProceeds({
      quantity: 10,
      unit: 'quintal',
      pricePerQuintal: 2500,
      transportCost: 1000,
      percentageCharges: 0.02, // 2%
    });

    // Gross: 10 * 2500 = 25000
    expect(result.grossValue).toBe(25000);
    
    // Percentage costs: 25000 * 0.02 = 500
    expect(result.percentageCosts).toBe(500);
    
    // Fixed costs: 1000
    expect(result.fixedCosts).toBe(1000);
    
    // Total expenses: 1500
    expect(result.totalSellingExpenses).toBe(1500);
    
    // Net proceeds: 25000 - 1500 = 23500
    expect(result.netProceeds).toBe(23500);

    // Break even selling only: 1000 / (10 * 0.98) = 1000 / 9.8 = 102.04...
    expect(result.breakEvenSellingOnly).toBeCloseTo(102.04, 2);
  });

  test('calculateNetProceeds correctly calculates profit when production cost is provided', () => {
    const result = calculateNetProceeds({
      quantity: 5,
      unit: 'tonne', // 50 quintals
      pricePerQuintal: 2000,
      transportCost: 5000,
      productionCost: 40000
    });

    // Gross: 50 * 2000 = 100000
    expect(result.grossValue).toBe(100000);
    
    // Total Expenses: 5000
    expect(result.totalSellingExpenses).toBe(5000);

    // Net Proceeds: 95000
    expect(result.netProceeds).toBe(95000);

    // Profit: 95000 - 40000 = 55000
    expect(result.profit).toBe(55000);
  });
});
