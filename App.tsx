import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LoanInputs, InvestmentInputs, UserType, CalculationResult, InvestmentResult } from './types';
import { DEFAULT_LOAN_INPUTS, DEFAULT_INV_INPUTS } from './constants';
import { calculateLoan, calculateInvestment } from './utils/finance';
import InputSection from './components/InputSection';
import ResultsSection from './components/ResultsSection';
import AmortizationTable from './components/AmortizationTable';
import DonateModal from './components/DonateModal';
import DisclaimerModal from './components/DisclaimerModal';

const App: React.FC = () => {
  const [loanInputs, setLoanInputs] = useState<LoanInputs>(DEFAULT_LOAN_INPUTS);
  const [invInputs, setInvInputs] = useState<InvestmentInputs>(DEFAULT_INV_INPUTS);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Memoize calculation to avoid re-renders on UI interactions not related to data
  const loanResult: CalculationResult = useMemo(() => {
    return calculateLoan(loanInputs);
  }, [loanInputs]);

  // Run calculateInvestment for both Personal and Business now (to get Advice/DTI)
  const invResult: InvestmentResult = useMemo(() => {
    return calculateInvestment(invInputs, loanResult, loanInputs);
  }, [invInputs, loanResult, loanInputs]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate calculation delay for UX
    setTimeout(() => {
      setIsAnalyzed(true);
      setIsAnalyzing(false);
      // Smooth scroll to results
      document.getElementById('results-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 600);
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      <DisclaimerModal />

      {/* Navbar */}
      <nav className="bg-[#0f172a] text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-white">D</div>
              <span className="font-bold text-xl tracking-tight">Dopi Financial</span>
            </div>
            <button
              onClick={() => setIsDonateOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
            >
              <span>☕</span> Mời team ly cà phê
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - Vertical Layout */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Input Section */}
        <div className="w-full">
          <InputSection 
            loanInputs={loanInputs} 
            setLoanInputs={setLoanInputs}
            invInputs={invInputs}
            setInvInputs={setInvInputs}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Anchor for scrolling */}
        <div id="results-anchor" className="h-1"></div>

        {/* Results Section */}
        <div id="results-container">
          {!isAnalyzed ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl h-[200px] flex flex-col items-center justify-center text-center p-8 opacity-70">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl text-slate-400">👇</span>
              </div>
              <p className="text-slate-500">
                Nhấn <span className="font-bold text-orange-500">Phân tích tài chính</span> để xem kết quả chi tiết bên dưới.
              </p>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <ResultsSection 
                loanResult={loanResult} 
                invResult={invResult}
                userType={loanInputs.userType}
                loanInputs={loanInputs}
                invInputs={invInputs}
              />
              
              <AmortizationTable schedule={loanResult.schedule} />
            </div>
          )}
        </div>
      </main>

      <DonateModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />
    </div>
  );
};

export default App;