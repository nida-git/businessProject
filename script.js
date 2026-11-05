// Private Equity Fund Prototype

const PrevLimitedPartners = [
  {
    name: "Rahul1",
    commitment: 1000000,
    invidualPercentage: 0 + "%",
    capitalCall: 0,
    commitmentLeft: 0,
    DateOfJoin: "2025-08-21",
    profitDistribution: 0,
    equilization: 0,
  },
  {
    name: "Rahul2",
    commitment: 2000000,
    invidualPercentage: 0 + "%",
    capitalCall: 0,
    commitmentLeft: 0,
    DateOfJoin: "2025-08-21",
    profitDistribution: 0,
    equilization: 0,
  },
  {
    name: "Rahul3",
    commitment: 3000000,
    invidualPercentage: 0 + "%",
    capitalCall: 0,
    commitmentLeft: 0,
    DateOfJoin: "2025-08-21",
    profitDistribution: 0,
    equilization: 0,
  },
];
const newLimitedPartnes = [
  {
    name: "Rahul4",
    commitment: 2000000,
    invidualPercentage: 0 + "%",
    capitalCall: 166670.00000000003,
    commitmentLeft: 0,
    DateOfJoin: "2026-02-11",
    profitDistribution: 0,
    equilization: 0,
  },
  {
    name: "Rahul5",
    commitment: 4000000,
    invidualPercentage: 0 + "%",
    capitalCall: 333330,
    commitmentLeft: 0,
    DateOfJoin: "2026-02-11",
    profitDistribution: 0,
    equilization: 0,
  },
];

const fundManager = [
  {
    Name: "sami",
  },
];

const investments = [
  {
    OrganisationName: "Tata company",
    Requirement: 1000000,
    profit: 800000,
  },
];

const limitedPartners = PrevLimitedPartners.concat(newLimitedPartnes);

const totalAmount = limitedPartners.reduce(
  (totalAmount, { commitment }) => totalAmount + commitment,
  0,
);

const investorRequirement = investments.reduce(
  (totalAmount, { Requirement }) => totalAmount + Requirement,
  0,
);

limitedPartners.forEach((obj) => {
  const num = (obj.commitment / totalAmount) * 100;
  const result = num.toFixed(3);
  obj.invidualPercentage = result + "%";

  const amountToBeTaken =
    (investorRequirement * parseFloat(obj.invidualPercentage)) / 100;
  obj.capitalCall = amountToBeTaken;
  obj.commitmentLeft = obj.commitment - obj.capitalCall;

  if (obj.commitmentLeft < 0) {
    throw new Error(`lp ${obj.name} money is not enough `);
  }
});

// console.log(limitedPartners)

let date1;
let rate = 0.1;
let totalEquilization = 0;

const investorProfit = investments.reduce(
  (totalAmount, { profit }) => totalAmount + profit,
  0,
);

limitedPartners.forEach((obj) => {
  const amountToBegiven =
    (investorProfit * parseFloat(obj.invidualPercentage)) / 100;
  obj.profitDistribution = amountToBegiven;
});
date1 = new Date(
  PrevLimitedPartners[PrevLimitedPartners.length - 1].DateOfJoin,
);

console.log(limitedPartners)

newLimitedPartnes.forEach((obj) => {
  const date2 = new Date(obj.DateOfJoin);

  const dateinms = date2 - date1;

  console.log(date1);
  console.log(date2);
  console.log(dateinms);

  const daysBetween = Math.ceil(dateinms / (1000 * 60 * 60 * 24));

  console.log(daysBetween);

  const equilizationAmount = Math.round(
    (obj.capitalCall * rate * daysBetween) / 365,
  );

  obj.equilization = "- " + equilizationAmount;

  totalEquilization += equilizationAmount;
});

PrevLimitedPartners.forEach((obj) => {
  const equilizationprofit =
    (totalEquilization * parseFloat(obj.invidualPercentage)) / 100;
  obj.equilization = "+ " + equilizationprofit;
});

console.log(limitedPartners);