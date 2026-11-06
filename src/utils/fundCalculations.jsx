// Fund calculation settings
const RATE = 0.1;
const FUND_CLOSE_DATE = "2025-08-21";

// Calculate all LP values
export const calculateLPs = (lps, companies) => {
  const activeCompanies = companies.filter(
    (company) => company.isActive !== false,
  );

  // Total LP commitments
  const totalCommitment = lps.reduce(
    (sum, lp) => sum + Number(lp.commitment),
    0,
  );

  // Total active company investment requirement
  const totalRequirement = activeCompanies.reduce(
    (sum, company) => sum + Number(company.requirement),
    0,
  );

  // Total active company profit
  const totalProfit = activeCompanies.reduce(
    (sum, company) => sum + Number(company.profit || 0),
    0,
  );

  // Calculate total equalization payable by late LPs
  let totalEqualization = 0;

  lps.forEach((lp) => {
    const isLate = new Date(lp.dateOfJoin) > new Date(FUND_CLOSE_DATE);

    if (isLate && totalCommitment > 0) {
      const ownership = (lp.commitment / totalCommitment) * 100;

      const capitalCall = (totalRequirement * ownership) / 100;

      const days = Math.ceil(
        (new Date(lp.dateOfJoin) - new Date(FUND_CLOSE_DATE)) / 86400000,
      );

      totalEqualization += (capitalCall * RATE * days) / 365;
    }
  });

  // Calculate individual LP values
  return lps.map((lp) => {
    const ownership = totalCommitment
      ? (lp.commitment / totalCommitment) * 100
      : 0;

    const capitalCall = (totalRequirement * ownership) / 100;

    const commitmentLeft = lp.commitment - capitalCall;

    const profitDistribution = (totalProfit * ownership) / 100;

    const isLate = new Date(lp.dateOfJoin) > new Date(FUND_CLOSE_DATE);

    let equalization;

    if (isLate) {
      const days = Math.ceil(
        (new Date(lp.dateOfJoin) - new Date(FUND_CLOSE_DATE)) / 86400000,
      );

      equalization = -Math.round((capitalCall * RATE * days) / 365);
    } else {
      equalization = (totalEqualization * ownership) / 100;
    }

    return {
      ...lp,
      ownership,
      capitalCall,
      commitmentLeft,
      profitDistribution,
      equalization,
      isLate,
    };
  });
};
