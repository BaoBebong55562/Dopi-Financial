import React, { useState } from 'react';
import { ScheduleRow } from '../types';

interface Props {
  schedule: ScheduleRow[];
}

const AmortizationTable: React.FC<Props> = ({ schedule }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (schedule.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="font-bold text-slate-800">Bảng tiến độ trả nợ chi tiết ({schedule.length} kỳ)</span>
        <svg 
          className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3">Kỳ</th>
                <th className="px-6 py-3 text-right">Dư nợ đầu kỳ</th>
                <th className="px-6 py-3 text-right">Gốc</th>
                <th className="px-6 py-3 text-right">Lãi</th>
                <th className="px-6 py-3 text-right">Tổng trả</th>
                <th className="px-6 py-3 text-right">Lá chắn thuế</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {schedule.map((row) => (
                <tr key={row.period} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium">{row.period}</td>
                  <td className="px-6 py-3 text-right">{(row.balance + row.principal).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}</td>
                  <td className="px-6 py-3 text-right">{row.principal.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}</td>
                  <td className="px-6 py-3 text-right text-red-500">{row.interest.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}</td>
                  <td className="px-6 py-3 text-right font-bold text-slate-800">{row.payment.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}</td>
                  <td className="px-6 py-3 text-right text-green-600">{row.taxShield > 0 ? row.taxShield.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AmortizationTable;