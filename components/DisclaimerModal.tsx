import React, { useState, useEffect } from 'react';

interface Props {
  onClose?: () => void;
}

const DisclaimerModal: React.FC<Props> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [hideFor30, setHideFor30] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem('dopi_hide_disclaimer_until');
    if (hideUntil && Date.now() < parseInt(hideUntil)) {
      return;
    }
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    if (!isChecked) return;
    
    if (hideFor30) {
      // 30 minutes in milliseconds
      const thirtyMinsLater = Date.now() + 30 * 60 * 1000;
      localStorage.setItem('dopi_hide_disclaimer_until', thirtyMinsLater.toString());
    }

    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Lưu ý quan trọng</h3>
        </div>
        
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-sm text-slate-600 leading-relaxed text-justify">
          <p className="mb-2">
            <strong>Dopi Financial</strong> ra đời với mục đích cung cấp công cụ tham khảo về tính toán tài chính.
          </p>
          <p>
            Các kết quả tính toán chỉ mang tính chất ước lượng dựa trên dữ liệu bạn nhập vào. Nếu bạn cần những góc nhìn chính xác nhất về pháp lý hoặc rủi ro thị trường, hãy <span className="font-semibold text-slate-800">gặp và nhận lời khuyên từ các chuyên gia tài chính</span> là tốt nhất.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 shadow-sm transition-all checked:border-blue-500 checked:bg-blue-500 hover:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
              <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-blue-600' : 'text-slate-700'}`}>
              Tôi đã đọc và hiểu rõ thông báo này
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group select-none">
             <div className="relative flex items-center">
              <input 
                type="checkbox" 
                checked={hideFor30}
                onChange={(e) => setHideFor30(e.target.checked)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 shadow-sm transition-all checked:border-slate-500 checked:bg-slate-500 hover:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
               <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm text-slate-500 group-hover:text-slate-600">
              Ẩn thông báo này trong 30 phút
            </span>
          </label>
        </div>

        <button
          onClick={handleClose}
          disabled={!isChecked}
          className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            isChecked 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 translate-y-0' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isChecked ? 'Tiếp tục sử dụng' : 'Vui lòng xác nhận để tiếp tục'}
          {isChecked && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;