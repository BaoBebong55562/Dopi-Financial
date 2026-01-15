export enum UserType {
  PERSONAL = 'PERSONAL',
  BUSINESS = 'BUSINESS'
}

export enum LoanPurpose {
  // Personal
  CONSUMPTION = 'CONSUMPTION', // Tiêu dùng
  HOME_BUYING = 'HOME_BUYING', // Mua nhà
  CAR_BUYING = 'CAR_BUYING',   // Mua xe
  // Business
  WORKING_CAPITAL = 'WORKING_CAPITAL', // Vốn lưu động
  ASSET_PURCHASE = 'ASSET_PURCHASE',   // Mua TSCĐ/Máy móc
  PROJECT_INVESTMENT = 'PROJECT_INVESTMENT' // Đầu tư dự án
}

export enum RepaymentMethod {
  ANNUITY = 'ANNUITY', // Dư nợ giảm dần (PMT cố định)
  REDUCING_BALANCE = 'REDUCING_BALANCE', // Dư nợ giảm dần (Gốc cố định)
  FLAT_RATE = 'FLAT_RATE' // Dư nợ ban đầu
}

export enum Frequency {
  MONTHLY = 12,
  QUARTERLY = 4,
  SEMI_ANNUALLY = 2,
  YEARLY = 1
}

export interface LoanInputs {
  amount: number;
  rate: number; // % per year
  termMonths: number;
  inflation: number; // % per year
  userType: UserType;
  purpose: LoanPurpose; // New field
  repaymentMethod: RepaymentMethod;
  frequency: Frequency;
  taxRate: number; // % (Business only)
  monthlyIncome: number; // New field (Personal only)
  gracePeriodMonths: number; // New: Interest only period
  balloonAmount: number; // New: Final lump sum payment
}

export interface InvestmentInputs {
  equity: number;
  projectedCashflow: number; // Yearly
  wacc: number; // %
}

export interface ScheduleRow {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  taxShield: number;
  realPayment: number; // Adjusted for inflation
}

export interface CalculationResult {
  totalInterest: number;
  totalPayment: number;
  totalTaxShield: number;
  realPV: number; // PV of debt adjusted for inflation
  schedule: ScheduleRow[];
  monthlyPaymentDisplay: number; // For display summary
}

export interface InvestmentResult {
  npv: number;
  irr: number;
  dscr: number;
  dti: number; // Debt to Income (Personal)
  recommendation: 'INVEST' | 'REJECT' | 'CAUTION' | 'SAFE' | 'RISKY';
  advice: string; // Detailed advice text
}