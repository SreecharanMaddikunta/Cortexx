export const convertToQuintals = (quantity, unit) => {
  if (quantity <= 0) return 0;
  switch (unit) {
    case 'kilogram':
      return quantity / 100;
    case 'tonne':
      return quantity * 10;
    case 'quintal':
    default:
      return quantity;
  }
};

export const calculateNetProceeds = ({
  quantity,
  unit,
  pricePerQuintal,
  transportCost = 0,
  loadingCost = 0,
  labourCost = 0,
  packagingCost = 0,
  otherCosts = 0,
  percentageCharges = 0, // e.g., 0.05 for 5%
  productionCost = 0 // Optional
}) => {
  const qQuintals = convertToQuintals(quantity, unit);
  if (qQuintals <= 0) {
    return { grossValue: 0, totalSellingExpenses: 0, netProceeds: 0, profit: 0, breakEvenSellingOnly: 0, breakEvenTotal: 0, netRealizedPrice: 0 };
  }

  const grossValue = qQuintals * pricePerQuintal;
  const fixedCosts = Number(transportCost) + Number(loadingCost) + Number(labourCost) + Number(packagingCost) + Number(otherCosts);
  const percentageCosts = grossValue * percentageCharges;
  const totalSellingExpenses = fixedCosts + percentageCosts;
  
  const netProceeds = grossValue - totalSellingExpenses;
  const profit = productionCost > 0 ? netProceeds - Number(productionCost) : null;
  const netRealizedPrice = netProceeds / qQuintals;

  let breakEvenSellingOnly = 0;
  let breakEvenTotal = 0;

  if (percentageCharges < 1) {
    breakEvenSellingOnly = fixedCosts / (qQuintals * (1 - percentageCharges));
    breakEvenTotal = (fixedCosts + Number(productionCost)) / (qQuintals * (1 - percentageCharges));
  } else {
    // Cannot break even if fee is 100% or more
    breakEvenSellingOnly = Infinity;
    breakEvenTotal = Infinity;
  }

  return {
    grossValue,
    fixedCosts,
    percentageCosts,
    totalSellingExpenses,
    netProceeds,
    profit,
    netRealizedPrice,
    breakEvenSellingOnly,
    breakEvenTotal
  };
};
