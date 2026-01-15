import React, { useState } from 'react';
import { LoanInputs, InvestmentInputs, UserType, RepaymentMethod, Frequency, LoanPurpose } from '../types';
import { REPAYMENT_OPTIONS, FREQUENCY_OPTIONS, PERSONAL_PURPOSE_OPTIONS, BUSINESS_PURPOSE_OPTIONS } from '../constants';

interface InputSectionProps {
  loanInputs: LoanInputs;
  setLoanInputs: React.Dispatch<React.SetStateAction<LoanInputs>>;
  invInputs: InvestmentInputs;
  setInvInputs: React.Dispatch<React.SetStateAction<InvestmentInputs>>;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ loanInputs, setLoanInputs, invInputs, setInvInputs, onAnalyze, isAnalyzing }) => {
  const [showWaccInfo, setShowWaccInfo] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleLoanChange = (key: keyof LoanInputs, value: any) => {
    setLoanInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleInvChange = (key: keyof InvestmentInputs, value: any) => {
    setInvInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleUserTypeChange = (type: UserType) => {
    // Set meaningful defaults when switching types
    if (type === UserType.PERSONAL) {
      setLoanInputs(prev => ({
        ...prev,
        userType: type,
        purpose: LoanPurpose.HOME_BUYING,
        amount: 2000000000,
        rate: 8.5,
        termMonths: 240,
        monthlyIncome: 60000000,
        frequency: Frequency.MONTHLY,
        gracePeriodMonths: 0,
        balloonAmount: 0
      }));
    } else {
      setLoanInputs(prev => ({
        ...prev,
        userType: type,
        purpose: LoanPurpose.WORKING_CAPITAL,
        amount: 5000000000,
        rate: 7.5,
        termMonths: 12,
        frequency: Frequency.MONTHLY,
        gracePeriodMonths: 0,
        balloonAmount: 0
      }));
    }
  };

  const handlePurposeChange = (purpose: LoanPurpose) => {
    // Smart Defaults based on Purpose
    let newTerm = loanInputs.termMonths;
    let newRate = loanInputs.rate;

    switch (purpose) {
      case LoanPurpose.HOME_BUYING:
        newTerm = 240; // 20 years
        newRate = 7.5;
        break;
      case LoanPurpose.CAR_BUYING:
        newTerm = 60; // 5 years
        newRate = 9.5;
        break;
      case LoanPurpose.CONSUMPTION:
        newTerm = 36; // 3 years
        newRate = 18.0; // Unsecured usually high
        break;
      case LoanPurpose.WORKING_CAPITAL:
        newTerm = 6; // Short term
        newRate = 6.5;
        break;
      case LoanPurpose.PROJECT_INVESTMENT:
        newTerm = 60; // 5 years
        newRate = 8.0;
        break;
      case LoanPurpose.ASSET_PURCHASE:
        newTerm = 48; // 4 years
        newRate = 8.5;
        break;
    }

    setLoanInputs(prev => ({ ...prev, purpose, termMonths: newTerm, rate: newRate }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
      <div className="flex-grow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Thông số đầu vào</h2>
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => handleUserTypeChange(UserType.PERSONAL)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${loanInputs.userType === UserType.PERSONAL ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Cá nhân
            </button>
            <button
              onClick={() => handleUserTypeChange(UserType.BUSINESS)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${loanInputs.userType === UserType.BUSINESS ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Doanh nghiệp
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Loan Section */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Cấu hình khoản vay
            </h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Mục đích vay</label>
                <select
                  value={loanInputs.purpose}
                  onChange={(e) => handlePurposeChange(e.target.value as LoanPurpose)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                >
                  {loanInputs.userType === UserType.PERSONAL 
                    ? PERSONAL_PURPOSE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)
                    : BUSINESS_PURPOSE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)
                  }
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền vay (VND)</label>
                <input
                  type="number"
                  value={loanInputs.amount}
                  onChange={(e) => handleLoanChange('amount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700"
                />
              </div>

              {loanInputs.userType === UserType.PERSONAL && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thu nhập hàng tháng (VND)</label>
                  <input
                    type="number"
                    value={loanInputs.monthlyIncome}
                    onChange={(e) => handleLoanChange('monthlyIncome', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="Nhập tổng thu nhập..."
                  />
                  <p className="text-[10px] text-slate-400 mt-1 absolute">*Dùng để tính khả năng trả nợ (DTI)</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lãi suất (%/năm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={loanInputs.rate}
                  onChange={(e) => handleLoanChange('rate', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kỳ hạn (tháng)</label>
                <input
                  type="number"
                  value={loanInputs.termMonths}
                  onChange={(e) => handleLoanChange('termMonths', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Phương thức trả nợ</label>
                <select
                  value={loanInputs.repaymentMethod}
                  onChange={(e) => handleLoanChange('repaymentMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {REPAYMENT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {loanInputs.userType === UserType.BUSINESS && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kỳ trả nợ</label>
                    <select
                      value={loanInputs.frequency}
                      onChange={(e) => handleLoanChange('frequency', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {FREQUENCY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Thuế TNDN (%)</label>
                    <input
                      type="number"
                      value={loanInputs.taxRate}
                      onChange={(e) => handleLoanChange('taxRate', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </>
              )}
              
              <div className={loanInputs.userType === UserType.BUSINESS ? "md:col-span-2" : "md:col-span-1"}>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lạm phát kỳ vọng (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={loanInputs.inflation}
                  onChange={(e) => handleLoanChange('inflation', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Advanced Configuration Toggle */}
              <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Cấu hình nâng cao (Ân hạn / Balloon)
                </button>
                
                {showAdvanced && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fade-in">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Ân hạn gốc (tháng)</label>
                       <input
                        type="number"
                        value={loanInputs.gracePeriodMonths}
                        onChange={(e) => handleLoanChange('gracePeriodMonths', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="VD: 12"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Chỉ trả lãi trong thời gian này</p>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Balloon Payment (VND)</label>
                       <input
                        type="number"
                        value={loanInputs.balloonAmount}
                        onChange={(e) => handleLoanChange('balloonAmount', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="VD: 500,000,000"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Gốc còn lại trả dứt điểm cuối kỳ</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-200 my-4"></div>

          {/* Investment Section - Only for Business */}
          <section className={`transition-all duration-300 ${loanInputs.userType === UserType.PERSONAL ? 'opacity-0 h-0 pointer-events-none overflow-hidden' : 'opacity-100 h-auto'}`}>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Thẩm định dự án
            </h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vốn chủ sở hữu (Equity)</label>
                <input
                  type="number"
                  value={invInputs.equity}
                  onChange={(e) => handleInvChange('equity', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dòng tiền dự kiến (Năm)</label>
                <input
                  type="number"
                  value={invInputs.projectedCashflow}
                  onChange={(e) => handleInvChange('projectedCashflow', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700">WACC (%)</label>
                  <button 
                    onClick={() => setShowWaccInfo(!showWaccInfo)}
                    className="text-xs text-orange-500 hover:text-orange-600 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {showWaccInfo ? 'Ẩn thông tin' : 'WACC là gì?'}
                  </button>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={invInputs.wacc}
                  onChange={(e) => handleInvChange('wacc', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none mb-2"
                />
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showWaccInfo ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
                    <p className="font-semibold text-slate-800 mb-1">Chi phí vốn bình quân gia quyền (WACC):</p>
                    <p className="mb-2 leading-relaxed">Là mức lãi suất trung bình mà doanh nghiệp phải trả cho các nguồn vốn tài trợ hoạt động (Vốn chủ sở hữu & Vốn vay).</p>
                    <div className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-800 mb-2 text-[10px] sm:text-xs overflow-x-auto whitespace-nowrap">
                      WACC = (E/V × Re) + [ (D/V × Rd) × (1 - T) ]
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500">
                      <li><span className="font-medium text-slate-700">Re:</span> Chi phí vốn chủ sở hữu</li>
                      <li><span className="font-medium text-slate-700">Rd:</span> Lãi suất vay (Chi phí nợ)</li>
                      <li><span className="font-medium text-slate-700">E, D:</span> Giá trị thị trường Vốn chủ, Nợ</li>
                      <li><span className="font-medium text-slate-700">T:</span> Thuế suất thuế TNDN</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      {/* Analyze Button */}
      <div className="pt-6 mt-2 border-t border-slate-100">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/30 active:scale-95 flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang tính toán...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Phân tích tài chính
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputSection;