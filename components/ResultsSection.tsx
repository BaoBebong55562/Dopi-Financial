import React, { useMemo } from 'react';
import { CalculationResult, InvestmentResult, UserType, LoanInputs, InvestmentInputs, LoanPurpose } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ComposedChart, Cell, LineChart, Line, ReferenceLine, Label } from 'recharts';

interface ResultsSectionProps {
  loanResult: CalculationResult;
  invResult: InvestmentResult;
  userType: UserType;
  loanInputs: LoanInputs;
  invInputs: InvestmentInputs;
}

const formatCurrency = (val: number) => {
  if (Math.abs(val) >= 1000000000) return (val / 1000000000).toFixed(2) + ' tỷ';
  if (Math.abs(val) >= 1000000) return (val / 1000000).toFixed(1) + ' tr';
  return val.toLocaleString('vi-VN');
};

const ResultsSection: React.FC<ResultsSectionProps> = ({ loanResult, invResult, userType, loanInputs, invInputs }) => {
  
  const isBusiness = userType === UserType.BUSINESS;

  // Prepare standard Schedule Chart Data
  const scheduleChartData = useMemo(() => {
    return loanResult.schedule.filter((_, i) => i % Math.max(1, Math.floor(loanResult.schedule.length / 50)) === 0).map(row => ({
      period: row.period,
      balance: row.balance,
      interest: row.interest,
      principal: row.principal
    }));
  }, [loanResult.schedule]);

  // Prepare Yearly Cashflow vs Debt Service Data (Business)
  const cashflowChartData = useMemo(() => {
    if (!isBusiness) return [];

    const yearMap = new Map<number, number>();
    loanResult.schedule.forEach(row => {
      const year = Math.ceil(row.period / loanInputs.frequency);
      const currentDebtService = yearMap.get(year) || 0;
      yearMap.set(year, currentDebtService + row.payment);
    });

    const yearsCount = Math.ceil(loanInputs.termMonths / 12);
    const data = [];
    for (let y = 1; y <= yearsCount; y++) {
      data.push({
        year: `Năm ${y}`,
        cashflow: invInputs.projectedCashflow,
        debtService: yearMap.get(y) || 0,
      });
    }
    return data;
  }, [loanResult.schedule, invInputs.projectedCashflow, loanInputs.frequency, loanInputs.termMonths, isBusiness]);

  // NPV Profile Data Generation
  const npvProfileData = useMemo(() => {
    if (!isBusiness) return [];

    // Reconstruct flows
    const years = Math.ceil(loanInputs.termMonths / 12);
    const loanPaymentsByYear = new Array(years).fill(0);
    loanResult.schedule.forEach(row => {
      const yearIndex = Math.ceil(row.period / loanInputs.frequency) - 1;
      if (yearIndex < years) loanPaymentsByYear[yearIndex] += row.payment;
    });

    const flows = [-invInputs.equity];
    for (let i = 0; i < years; i++) {
        flows.push(invInputs.projectedCashflow - loanPaymentsByYear[i]);
    }

    const wacc = invInputs.wacc;
    const irr = invResult.irr;
    
    // Determine scale
    let maxRate = 50;
    if (irr > 0 && irr < 1000) {
        maxRate = Math.max(irr * 1.5, wacc * 1.5, 30);
    } else {
        maxRate = Math.max(wacc * 2, 40);
    }
    maxRate = Math.min(maxRate, 100); // Cap at 100% for visual sanity

    const data = [];
    const step = maxRate / 40; 
    
    for (let r = 0; r <= maxRate; r += step) {
        // Calculate NPV
        const rateDecimal = r / 100;
        const npv = flows.reduce((acc, val, t) => acc + val / Math.pow(1 + rateDecimal, t), 0);
        data.push({
            rate: r,
            npv: npv
        });
    }
    return data;
  }, [isBusiness, loanInputs, loanResult, invInputs, invResult]);

  // Income Distribution Data (Personal)
  const incomeDistData = useMemo(() => {
    if (isBusiness) return [];
    const loanPayment = loanResult.monthlyPaymentDisplay;
    const income = loanInputs.monthlyIncome;
    const remaining = income > loanPayment ? income - loanPayment : 0;
    return [
      { name: 'Trả nợ', value: loanPayment, color: '#ef4444' },
      { name: 'Chi tiêu & Khác', value: remaining, color: '#10b981' }
    ];
  }, [loanResult.monthlyPaymentDisplay, loanInputs.monthlyIncome, isBusiness]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-semibold">Trả định kỳ (Tháng đầu)</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(loanResult.monthlyPaymentDisplay)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-semibold">Tổng lãi phải trả</p>
          <p className="text-xl font-bold text-red-500 mt-1">{formatCurrency(loanResult.totalInterest)}</p>
        </div>
        
        {isBusiness ? (
           <>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-bl-full -mr-8 -mt-8"></div>
              <p className="text-xs text-slate-500 uppercase font-semibold relative z-10">Lá chắn thuế</p>
              <p className="text-xl font-bold text-green-600 mt-1 relative z-10">{formatCurrency(loanResult.totalTaxShield)}</p>
            </div>
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-semibold">PV thực (Lạm phát)</p>
              <p className="text-xl font-bold text-blue-600 mt-1">{formatCurrency(loanResult.realPV)}</p>
            </div>
           </>
        ) : (
           <>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
               <p className="text-xs text-slate-500 uppercase font-semibold">Tổng gốc + Lãi</p>
               <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(loanResult.totalPayment)}</p>
           </div>
           <div className={`p-4 rounded-2xl shadow-sm border border-slate-200 ${invResult.recommendation === 'SAFE' ? 'bg-green-50' : invResult.recommendation === 'RISKY' ? 'bg-red-50' : 'bg-yellow-50'}`}>
              <p className="text-xs text-slate-500 uppercase font-semibold">Sức khỏe tài chính (DTI)</p>
              <p className={`text-xl font-bold mt-1 ${invResult.recommendation === 'SAFE' ? 'text-green-600' : invResult.recommendation === 'RISKY' ? 'text-red-600' : 'text-yellow-600'}`}>
                {invResult.dti.toFixed(1)}% <span className="text-xs font-normal">({invResult.recommendation === 'SAFE' ? 'An toàn' : invResult.recommendation === 'RISKY' ? 'Nguy hiểm' : 'Cảnh báo'})</span>
              </p>
           </div>
           </>
        )}
      </div>

      {/* AI Advice Section (New) */}
      <div className={`rounded-2xl p-6 shadow-sm border-l-4 ${
          invResult.recommendation === 'INVEST' || invResult.recommendation === 'SAFE' ? 'bg-blue-50 border-blue-500' : 
          invResult.recommendation === 'REJECT' || invResult.recommendation === 'RISKY' ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-400'
        }`}>
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-full shadow-sm">
             <span className="text-2xl">💡</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Đánh giá & Khuyến nghị từ AI</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{invResult.advice}</p>
          </div>
        </div>
      </div>

      {/* Investment Appraisal (Business Only) */}
      {isBusiness && (
        <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-16 -mt-16"></div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
            <span className="text-orange-400">⚡</span> Thẩm định dự án
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
             <div>
                <p className="text-slate-400 text-xs uppercase mb-1">NPV</p>
                <p className={`text-2xl font-bold ${invResult.npv > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(invResult.npv)}
                </p>
             </div>
             <div>
                <p className="text-slate-400 text-xs uppercase mb-1">IRR</p>
                <p className="text-2xl font-bold text-white">{invResult.irr.toFixed(2)}%</p>
             </div>
             <div>
                <p className="text-slate-400 text-xs uppercase mb-1">DSCR (Min)</p>
                <p className={`text-2xl font-bold ${invResult.dscr >= 1.2 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {invResult.dscr.toFixed(2)}x
                </p>
             </div>
             <div className="flex flex-col justify-center">
               <div className={`px-4 py-2 rounded-lg text-center text-sm font-bold border ${
                 invResult.recommendation === 'INVEST' ? 'bg-green-500/20 border-green-500 text-green-400' :
                 invResult.recommendation === 'REJECT' ? 'bg-red-500/20 border-red-500 text-red-400' :
                 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
               }`}>
                 {invResult.recommendation === 'INVEST' ? 'NÊN ĐẦU TƯ' :
                  invResult.recommendation === 'REJECT' ? 'TỪ CHỐI' : 'CÂN NHẮC'}
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Personal: Income Allocation Chart */}
        {!isBusiness && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h4 className="text-sm font-bold text-slate-700 mb-4">Phân bổ dòng tiền hàng tháng</h4>
             <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeDistData} layout="vertical" margin={{ left: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                     <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'transparent'}} />
                     <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                        {incomeDistData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <h4 className="text-sm font-bold text-slate-700 mb-4">Dư nợ gốc theo thời gian</h4>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={scheduleChartData}>
                 <defs>
                   <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                 <XAxis dataKey="period" hide />
                 <YAxis hide domain={['auto', 'auto']} />
                 <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Kỳ ${label}`}
                  />
                 <Area type="monotone" dataKey="balance" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h4 className="text-sm font-bold text-slate-700 mb-4">Cấu trúc trả nợ (Gốc vs Lãi)</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scheduleChartData} stackOffset="sign">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                <XAxis dataKey="period" hide />
                <YAxis hide />
                <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Kỳ ${label}`}
                />
                <Legend iconType="circle" />
                <Bar dataKey="principal" name="Gốc" stackId="a" fill="#3b82f6" radius={[0,0,0,0]} />
                <Bar dataKey="interest" name="Lãi" stackId="a" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Business Charts Section */}
      {isBusiness && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Cashflow vs Debt Service Chart */}
           {cashflowChartData.length > 0 && (
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <h4 className="text-sm font-bold text-slate-700 mb-4">Dòng tiền & Nghĩa vụ nợ (Hàng năm)</h4>
               <div className="h-72 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={cashflowChartData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                     <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis hide />
                     <Tooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        formatter={(value: number) => formatCurrency(value)}
                        cursor={{ fill: '#f1f5f9' }}
                     />
                     <Legend iconType="circle" verticalAlign="top" align="right" wrapperStyle={{paddingBottom: '20px'}}/>
                     <Bar dataKey="cashflow" name="Dòng tiền vào (CF)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                     <Bar dataKey="debtService" name="Nghĩa vụ nợ (DS)" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} />
                   </ComposedChart>
                 </ResponsiveContainer>
               </div>
             </div>
           )}

           {/* NPV Profile Chart */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h4 className="text-sm font-bold text-slate-700 mb-4">Hồ sơ NPV (Biến động theo lãi suất)</h4>
             <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={npvProfileData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                   <XAxis 
                      dataKey="rate" 
                      type="number" 
                      tickCount={8} 
                      unit="%" 
                      tick={{fontSize: 10}}
                      domain={[0, 'auto']}
                    />
                   <YAxis 
                      hide
                      domain={['auto', 'auto']}
                   />
                   <Tooltip
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      formatter={(value: number) => [formatCurrency(value), "NPV"]}
                      labelFormatter={(label) => `Lãi suất chiết khấu: ${Number(label).toFixed(1)}%`}
                   />
                   <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                   
                   {invInputs.wacc < npvProfileData[npvProfileData.length-1]?.rate && (
                     <ReferenceLine x={invInputs.wacc} stroke="#f97316" strokeDasharray="4 2">
                       <Label value="WACC" position="top" fill="#f97316" fontSize={10} />
                     </ReferenceLine>
                   )}
                   
                   {invResult.irr > 0 && invResult.irr < npvProfileData[npvProfileData.length-1]?.rate && (
                     <ReferenceLine x={invResult.irr} stroke="#10b981" strokeDasharray="4 2">
                       <Label value="IRR" position="top" fill="#10b981" fontSize={10} />
                     </ReferenceLine>
                   )}

                   <Line 
                      type="monotone" 
                      dataKey="npv" 
                      stroke="#0f172a" 
                      strokeWidth={3} 
                      dot={false}
                      activeDot={{r: 6}}
                   />
                 </LineChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ResultsSection;