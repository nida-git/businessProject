const RATE = 0.08;

export function calculateEqualization(capitalCall, days, rate = RATE) {
  return Math.round(
    (Number(capitalCall || 0) * rate * Number(days || 0)) / 365,
    
  );
}

// Calculate LP values
export function calculateLPs(lps, companies, mergedCloseDates = []) {
  if (!lps.length) return [];

  const totalCommitment = lps.reduce(
    (sum, lp) => sum + Number(lp.commitment || 0),
    0,
  );

  const totalRequirement = companies.reduce(
    (sum, company) => sum + Number(company.requirement || 0),
    0,
  );

  const totalProfit = companies.reduce(
    (sum, company) => sum + Number(company.profit || 0),
    0,
  );

  // Step 1: Calculate basic LP values
  const calculated = lps.map((lp) => {
    const ownership = totalCommitment
      ? (Number(lp.commitment) / totalCommitment) * 100
      : 0;

    const capitalCall = (totalRequirement * ownership) / 100;

    return {
      ...lp,
      ownership,
      capitalCall,
      commitmentLeft: Number(lp.commitment) - capitalCall,
      equalization: 0,
      profitDistribution: (totalProfit * ownership) / 100,
      closeNumber: 0,
    };
  });

  // Step 2: Group LPs by joining date
  const closeMap = new Map();

  calculated.forEach((lp) => {
    const date = lp.dateOfJoin;

    if (!closeMap.has(date)) {
      closeMap.set(date, []);
    }

    closeMap.get(date).push(lp);
  });

  const dates = [...closeMap.keys()].sort((a, b) => new Date(a) - new Date(b));

  const merged = new Set(mergedCloseDates);

  let previousLPs = [];
  let previousDate = null;

  // Step 3: Process closes sequentially
  for (let index = 0; index < dates.length; index++) {
    const date = dates[index];
    const currentLPs = closeMap.get(date);

    currentLPs.forEach((lp) => {
      lp.closeNumber = index + 1;
    });

    // First close is the initial close
    if (index === 0) {
      previousLPs = [...currentLPs];
      previousDate = date;
      continue;
    }

    // Stop when the next close has not been merged
    if (!merged.has(date)) {
      break;
    }

    const days = Math.ceil(
      (new Date(date) - new Date(previousDate)) / 86400000,
    );

    // Step 4: Calculate equalization payable by new LPs
    let totalEqualization = 0;

    currentLPs.forEach((lp) => {
      const amount = calculateEqualization(lp.capitalCall, days);

      // Negative means the new LP pays
      lp.equalization = -amount;

      totalEqualization += amount;
    });

    // Step 5: Distribute equalization to previous LPs
    const oldCommitment = previousLPs.reduce(
      (sum, lp) => sum + Number(lp.commitment || 0),
      0,
    );

    let distributed = 0;

    previousLPs.forEach((lp, i) => {
      const share =
        i === previousLPs.length - 1
          ? totalEqualization - distributed
          : oldCommitment > 0
            ? Math.round(
                (totalEqualization * Number(lp.commitment)) / oldCommitment,
              )
            : 0;

      lp.equalization += share;
      distributed += share;
    });

    // Step 6: Merge this close into previous closes
    previousLPs = [...previousLPs, ...currentLPs];
    previousDate = date;
  }

  return calculated;
}

// Preview the next close without merging it
export function getNextClose(lps, companies, mergedCloseDates = []) {
  if (!lps.length) return null;

  const dates = [...new Set(lps.map((lp) => lp.dateOfJoin))].sort(
    (a, b) => new Date(a) - new Date(b),
  );

  if (dates.length < 2) return null;

  const merged = new Set(mergedCloseDates);

  // Find the first pending close in sequence
  let nextIndex = -1;

  for (let index = 1; index < dates.length; index++) {
    if (!merged.has(dates[index])) {
      nextIndex = index;
      break;
    }
  }

  if (nextIndex === -1) return null;

  const date = dates[nextIndex];
  const previousDate = dates[nextIndex - 1];

  // Previous close must already be merged
  if (nextIndex > 1 && !merged.has(previousDate)) {
    return null;
  }

  const days = Math.ceil((new Date(date) - new Date(previousDate)) / 86400000);

  const calculated = calculateLPs(lps, companies, mergedCloseDates);

  const pendingLPs = calculated
    .filter((lp) => lp.dateOfJoin === date)
    .map((lp) => {
      const equalization = calculateEqualization(lp.capitalCall, days);

      return {
        ...lp,
        equalization: -equalization,
      };
    });

  const totalEqualization = pendingLPs.reduce(
    (sum, lp) => sum + Math.abs(lp.equalization),
    0,
  );

  return {
    date,
    previousDate,
    days,
    lps: pendingLPs,
    totalEqualization,
  };
}
