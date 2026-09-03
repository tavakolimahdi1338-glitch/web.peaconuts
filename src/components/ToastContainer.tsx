import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-stone-900 text-white';
        let Icon = Info;
        if (toast.type === 'success') {
          bg = 'bg-emerald-800 text-emerald-50 border border-emerald-700';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bg = 'bg-amber-900 text-amber-50 border border-amber-800';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-xl text-sm font-medium transition-all transform animate-in slide-in-from-top-2 ${bg}`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className="w-5 h-5 shrink-0" />
              <p className="leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors mr-2 shrink-0"
              aria-label="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
