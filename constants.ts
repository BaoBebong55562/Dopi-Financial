import { RepaymentMethod, UserType, Frequency, LoanPurpose } from './types';

export const COLORS = {
  primary: '#0f172a', // Navy Blue
  accent: '#f97316', // Orange
  success: '#10b981',
  danger: '#ef4444',
  text: '#1e293b',
  bg: '#f8fafc'
};

export const REPAYMENT_OPTIONS = [
  { value: RepaymentMethod.ANNUITY, label: 'Dư nợ giảm dần (Góp đều)' },
  { value: RepaymentMethod.REDUCING_BALANCE, label: 'Dư nợ giảm dần (Gốc đều)' },
  { value: RepaymentMethod.FLAT_RATE, label: 'Dư nợ ban đầu (Lãi phẳng)' }
];

export const FREQUENCY_OPTIONS = [
  { value: Frequency.MONTHLY, label: 'Hàng tháng' },
  { value: Frequency.QUARTERLY, label: 'Hàng quý' },
  { value: Frequency.SEMI_ANNUALLY, label: '6 Tháng/lần' },
  { value: Frequency.YEARLY, label: 'Hàng năm' }
];

export const PERSONAL_PURPOSE_OPTIONS = [
  { value: LoanPurpose.HOME_BUYING, label: '🏡 Vay mua nhà' },
  { value: LoanPurpose.CAR_BUYING, label: '🚗 Vay mua ô tô' },
  { value: LoanPurpose.CONSUMPTION, label: '🛍️ Vay tiêu dùng' },
];

export const BUSINESS_PURPOSE_OPTIONS = [
  { value: LoanPurpose.WORKING_CAPITAL, label: '🔄 Bổ sung vốn lưu động' },
  { value: LoanPurpose.ASSET_PURCHASE, label: '🏭 Mua sắm máy móc/TSCĐ' },
  { value: LoanPurpose.PROJECT_INVESTMENT, label: '🚀 Đầu tư dự án mới' },
];

export const DEFAULT_LOAN_INPUTS = {
  amount: 2000000000,
  rate: 8.5,
  termMonths: 240,
  inflation: 4,
  userType: UserType.PERSONAL,
  purpose: LoanPurpose.HOME_BUYING,
  repaymentMethod: RepaymentMethod.ANNUITY,
  frequency: Frequency.MONTHLY,
  taxRate: 20,
  monthlyIncome: 60000000,
  gracePeriodMonths: 0,
  balloonAmount: 0
};

export const DEFAULT_INV_INPUTS = {
  equity: 1000000000,
  projectedCashflow: 600000000,
  wacc: 12
};