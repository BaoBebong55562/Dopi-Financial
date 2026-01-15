import { LoanInputs, RepaymentMethod, ScheduleRow, CalculationResult, Frequency, InvestmentInputs, InvestmentResult, UserType, LoanPurpose } from '../types';

export const calculateLoan = (inputs: LoanInputs): CalculationResult => {
  const { amount, rate, termMonths, inflation, repaymentMethod, frequency, taxRate, userType, gracePeriodMonths, balloonAmount } = inputs;
  
  if (amount <= 0 || termMonths <= 0) {
    return { totalInterest: 0, totalPayment: 0, totalTaxShield: 0, realPV: 0, schedule: [], monthlyPaymentDisplay: 0 };
  }

  const annualRate = rate / 100;
  const periodicRate = annualRate / frequency;
  const years = termMonths / 12;
  const totalPeriods = Math.ceil(years * frequency);
  
  // Calculate periods for grace (convert months to periods based on frequency)
  const monthsPerPeriod = 12 / frequency;
  const gracePeriods = Math.ceil(gracePeriodMonths / monthsPerPeriod);
  
  // Amortization happens over the remaining periods
  const amortizationPeriods = totalPeriods - gracePeriods;

  const annualInflation = inflation / 100;
  const inflationPerPeriod = Math.pow(1 + annualInflation, 1 / frequency) - 1;

  const schedule: ScheduleRow[] = [];
  let balance = amount;
  let totalInterest = 0;
  let totalPayment = 0;
  let totalTaxShield = 0;
  let realPV = 0;

  // Validate inputs
  if (amortizationPeriods < 0) {
    // Edge case: Grace period longer than term. Treat entire term as Interest Only? 
    // Or just clamp. Let's return empty/zero to avoid infinite loops, or handle gracefully.
    return { totalInterest: 0, totalPayment: 0, totalTaxShield: 0, realPV: 0, schedule: [], monthlyPaymentDisplay: 0 };
  }
  
  // Ensure Balloon doesn't exceed Amount (logic safety, though UI might allow it)
  const safeBalloon = Math.min(balloonAmount, amount);
  const principalToAmortize = amount - safeBalloon;

  // --- 1. PERIOD LOOP ---
  for (let i = 1; i <= totalPeriods; i++) {
    let interest = balance * periodicRate;
    let principal = 0;
    let payment = 0;

    // A. GRACE PERIOD PHASE
    if (i <= gracePeriods) {
      principal = 0;
      payment = interest;
    } 
    // B. AMORTIZATION PHASE
    else {
      if (repaymentMethod === RepaymentMethod.ANNUITY) {
        if (amortizationPeriods === 0) {
          // Should not happen due to check above, but for safety:
          principal = principalToAmortize;
        } else {
          // Standard Annuity Formula solving for PMT given PV (principalToAmortize) and FV=0 (implicitly handled by segregating balloon)
          // PMT = P * r * (1+r)^n / ((1+r)^n - 1)
          // Here P = principalToAmortize
          const pmtStandard = periodicRate === 0 
            ? principalToAmortize / amortizationPeriods 
            : (principalToAmortize * periodicRate * Math.pow(1 + periodicRate, amortizationPeriods)) / (Math.pow(1 + periodicRate, amortizationPeriods) - 1);
          
          payment = pmtStandard;
          
          // Recalculate principal part based on this fixed payment
          // Note: In Annuity, payment is fixed, so principal = payment - interest
          principal = payment - interest;
        }
      } 
      else if (repaymentMethod === RepaymentMethod.REDUCING_BALANCE) {
        // Fixed Principal
        principal = principalToAmortize / amortizationPeriods;
        payment = principal + interest;
      } 
      else if (repaymentMethod === RepaymentMethod.FLAT_RATE) {
        // Flat rate usually applies interest on the INITIAL amount for the whole term.
        // If there is a grace period, usually Flat Rate loans just defer the principal.
        // Interest is constant.
        const flatInterestPerPeriod = (amount * annualRate * years) / totalPeriods;
        
        // Principal is spread over amortization periods? Or total periods?
        // Usually Flat Rate implies simplistic calculation: Total Principal / Total Periods.
        // But with Grace, let's spread Principal over Amortization Periods.
        principal = principalToAmortize / amortizationPeriods;
        interest = flatInterestPerPeriod; // Overwrite the declining balance interest
        payment = principal + interest;
      }
    }

    // C. BALLOON PAYMENT (Final Period)
    if (i === totalPeriods) {
      // Add the balloon amount to the principal payment of the last month
      // effectively clearing the remaining balance (which should be equal to safeBalloon)
      
      // However, mathematical precision issues might make balance slightly off.
      // We force the final principal payment to clear the balance.
      
      // Logic: The Calculated Principal above reduces 'principalToAmortize'. 
      // The 'safeBalloon' is left over.
      
      const remainingBeforePay = balance;
      // We want final balance to be 0. 
      // So Principal Paid must equal Remaining Balance.
      // The 'principal' calculated above covers the amortization part.
      // We add the balloon part.
      
      if (repaymentMethod === RepaymentMethod.ANNUITY) {
        // For Annuity, the calculated PMT covers the amortization. 
        // We just add balloon to the final payment.
        principal += safeBalloon;
        payment += safeBalloon;
        
        // Adjust for rounding errors in the very last step to ensure exactly 0
        const diff = remainingBeforePay - principal;
        principal += diff;
        payment += diff;
      } 
      else {
         // Linear / Flat
         principal += safeBalloon;
         payment += safeBalloon;
         
         // Rounding fix
         const diff = remainingBeforePay - principal;
         principal += diff;
         payment += diff;
      }
    }

    balance -= principal;
    if (balance < 1) balance = 0; // Tolerance

    const taxSave = (userType === 'BUSINESS' ? interest * (taxRate / 100) : 0);
    const realVal = payment / Math.pow(1 + inflationPerPeriod, i);

    schedule.push({ period: i, payment, principal, interest, balance, taxShield: taxSave, realPayment: realVal });
    
    totalInterest += interest;
    totalPayment += payment;
    totalTaxShield += taxSave;
    realPV += realVal;
  }

  // Determine Monthly Payment Display
  // If Annuity, use the payment during amortization phase (if exists), otherwise first payment
  let monthlyPaymentDisplay = 0;
  if (schedule.length > 0) {
    // If there is a grace period, the first payment (Interest only) is different from the Annuity payment.
    // Users usually want to know the "EMIs" (Equated Monthly Installment).
    if (gracePeriods > 0 && schedule.length > gracePeriods) {
      monthlyPaymentDisplay = schedule[gracePeriods].payment; // First payment of amortization
    } else {
      monthlyPaymentDisplay = schedule[0].payment;
    }
  }

  return {
    totalInterest,
    totalPayment,
    totalTaxShield,
    realPV,
    schedule,
    monthlyPaymentDisplay
  };
};

export const calculateInvestment = (inv: InvestmentInputs, loanRes: CalculationResult, loanInputs: LoanInputs): InvestmentResult => {
  const { equity, projectedCashflow, wacc } = inv;

  // --- PERSONAL FINANCE LOGIC ---
  if (loanInputs.userType === UserType.PERSONAL) {
    const monthlyPayment = loanRes.monthlyPaymentDisplay;
    const income = loanInputs.monthlyIncome;
    const dti = income > 0 ? (monthlyPayment / income) * 100 : 0;
    
    let advice = "";
    let recommendation: 'SAFE' | 'CAUTION' | 'RISKY' = 'SAFE';

    // Logic Advice based on DTI and Purpose
    if (dti <= 30) {
      recommendation = 'SAFE';
      advice = `Tỷ lệ nợ/thu nhập (DTI) của bạn là ${dti.toFixed(1)}%, nằm trong ngưỡng an toàn (<30%). Dòng tiền của bạn dư giả để chi tiêu và đầu tư khác. Khoản vay này rất khả thi.`;
    } else if (dti <= 45) {
      recommendation = 'CAUTION';
      advice = `Tỷ lệ nợ/thu nhập (DTI) là ${dti.toFixed(1)}%, ở mức trung bình. Bạn cần quản lý chặt chẽ chi tiêu sinh hoạt. Nếu lãi suất thả nổi tăng, áp lực trả nợ sẽ lớn.`;
    } else {
      recommendation = 'RISKY';
      advice = `CẢNH BÁO: DTI là ${dti.toFixed(1)}% (>45%). Gánh nặng nợ quá lớn so với thu nhập! Rủi ro vỡ nợ rất cao nếu thu nhập giảm hoặc lãi suất tăng. Hãy cân nhắc: 1) Giảm số tiền vay, hoặc 2) Tăng vốn tự có.`;
    }

    // Specific Advice based on Purpose
    if (loanInputs.purpose === LoanPurpose.CAR_BUYING && dti > 30) {
      advice += "\nLưu ý: Xe hơi là tiêu sản và tốn thêm chi phí nuôi xe (xăng, bảo dưỡng ~3-5tr/tháng). Hãy cộng thêm chi phí này vào gánh nặng tài chính.";
    }
    
    // Updated Logic for Home Buying Advice
    if (loanInputs.purpose === LoanPurpose.HOME_BUYING && dti > 40) {
      advice += "\n💡 MẸO TÀI CHÍNH: Với DTI hiện tại trên 40%, để đảm bảo an toàn tài chính và khả năng chi trả hàng tháng, bạn nên cân nhắc kéo dài thời gian vay lên 20 - 30 năm (240 - 360 tháng). Điều này sẽ giúp giảm số tiền phải trả mỗi tháng đáng kể.";
    }
    
    // Advice for Grace Period / Balloon
    if (loanInputs.gracePeriodMonths > 0) {
       advice += `\n⏳ Bạn đang sử dụng ân hạn gốc ${loanInputs.gracePeriodMonths} tháng. Lưu ý: Sau thời gian này, áp lực trả nợ sẽ tăng lên do phải bắt đầu trả gốc. Hãy chuẩn bị dòng tiền cho thời điểm đó.`;
    }
    if (loanInputs.balloonAmount > 0) {
       advice += `\n💣 Khoản Balloon Payment cuối kỳ ${(loanInputs.balloonAmount/1e6).toFixed(0)}tr là một áp lực lớn. Hãy chắc chắn bạn có kế hoạch tích lũy hoặc bán tài sản để tất toán đúng hạn.`;
    }

    return { npv: 0, irr: 0, dscr: 0, dti, recommendation, advice };
  }

  // --- BUSINESS FINANCE LOGIC ---
  if (equity <= 0) return { npv: 0, irr: 0, dscr: 0, dti: 0, recommendation: 'CAUTION', advice: "Vui lòng nhập Vốn chủ sở hữu hợp lệ." };

  const years = Math.ceil(loanInputs.termMonths / 12);
  const waccRate = wacc / 100;

  const loanPaymentsByYear: number[] = new Array(years).fill(0);
  loanRes.schedule.forEach(row => {
    const yearIndex = Math.ceil(row.period / loanInputs.frequency) - 1;
    if (yearIndex < years) loanPaymentsByYear[yearIndex] += row.payment;
  });

  const flows: number[] = [-equity];
  let minDSCR = Infinity;

  for (let i = 0; i < years; i++) {
    const debtService = loanPaymentsByYear[i];
    const netFlow = projectedCashflow - debtService; 
    flows.push(netFlow);
    const dscr = debtService === 0 ? Infinity : projectedCashflow / debtService;
    if (dscr < minDSCR) minDSCR = dscr;
  }

  let npv = 0;
  for (let t = 0; t < flows.length; t++) {
    npv += flows[t] / Math.pow(1 + waccRate, t);
  }

  // IRR Calculation
  const calculateIRR = (cashFlows: number[], guess = 0.1): number => {
    const maxIter = 50; const tol = 0.00001; let r = guess;
    for (let i = 0; i < maxIter; i++) {
      let npvVal = 0; let dNpvVal = 0;
      for (let t = 0; t < cashFlows.length; t++) {
        npvVal += cashFlows[t] / Math.pow(1 + r, t);
        dNpvVal += -t * cashFlows[t] / Math.pow(1 + r, t + 1);
      }
      if (Math.abs(dNpvVal) < tol) break;
      const newR = r - npvVal / dNpvVal;
      if (Math.abs(newR - r) < tol) return newR;
      r = newR;
    }
    return r;
  };
  const irr = calculateIRR(flows);

  // Business Recommendation & Advice
  let recommendation: 'INVEST' | 'REJECT' | 'CAUTION' = 'CAUTION';
  let advice = "";

  const dscrSafe = minDSCR >= 1.2;
  const positiveNPV = npv > 0;

  if (positiveNPV && dscrSafe) {
    recommendation = 'INVEST';
    advice = `Dự án RẤT KHẢ THI. NPV dương (${(npv/1e6).toFixed(0)}tr) cho thấy dự án tạo ra giá trị thực. DSCR tối thiểu ${minDSCR.toFixed(2)}x đảm bảo khả năng trả nợ tốt ngay cả khi dòng tiền biến động nhẹ. IRR ${irr*100 > wacc ? 'cao hơn' : 'thấp hơn'} WACC.`;
  } else if (!positiveNPV && !dscrSafe) {
    recommendation = 'REJECT';
    advice = `KHÔNG NÊN ĐẦU TƯ. Dự án làm giảm giá trị doanh nghiệp (NPV âm). Dòng tiền hoạt động không đủ trả nợ (DSCR < 1.2). Rủi ro phá sản cao.`;
  } else if (positiveNPV && !dscrSafe) {
    recommendation = 'CAUTION';
    advice = `CÂN NHẮC KỸ. Dự án có lời (NPV dương) nhưng áp lực trả nợ rất lớn trong các năm đầu (DSCR thấp). Bạn cần tái cấu trúc nợ (kéo dài kỳ hạn) hoặc chuẩn bị nguồn vốn lưu động dự phòng để tránh mất thanh khoản.`;
  } else {
    recommendation = 'CAUTION';
    advice = `CÂN NHẮC. Dự án an toàn về dòng tiền trả nợ nhưng hiệu quả sinh lời thấp (NPV âm). Chỉ nên đầu tư nếu dự án mang lại lợi ích chiến lược phi tài chính (thị phần, thương hiệu).`;
  }
  
  if (loanInputs.balloonAmount > 0 && minDSCR > 1.2 && minDSCR < 1.5) {
      advice += " Lưu ý: Với Balloon Payment lớn cuối kỳ, hãy đảm bảo bạn có kế hoạch tái tài trợ hoặc tích lũy tiền mặt.";
  }

  return { npv, irr: irr * 100, dscr: minDSCR === Infinity ? 0 : minDSCR, dti: 0, recommendation, advice };
};