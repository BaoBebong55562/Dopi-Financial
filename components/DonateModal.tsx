import React, { useEffect } from 'react';
import { COLORS } from '../constants';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDonate = () => {
    // Trigger Confetti
    if ((window as any).confetti) {
      (window as any).confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [COLORS.accent, COLORS.primary, '#ffffff']
      });
    }
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Mời Team ly cà phê</h3>
          <p className="text-slate-600 mb-6">Cảm ơn bạn đã sử dụng Dopi Financial App. Sự ủng hộ của bạn là động lực để chúng tôi phát triển tốt hơn!</p>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Ngân hàng</span>
              <span className="font-semibold text-slate-800">Techcombank</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Số tài khoản</span>
              <span className="font-mono font-bold text-slate-800">345678159999</span>
            </div>
             <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Chủ tài khoản</span>
              <span className="font-semibold text-slate-800">NGUYEN HO GIA BAO</span>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">
              [QR Code Placeholder]
            </div>
          </div>

          <button
            onClick={handleDonate}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/30 active:scale-95"
          >
            Đã ủng hộ!
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonateModal;