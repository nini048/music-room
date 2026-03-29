'use client';

import { useToastStore } from '@/store/useToastStore';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

const iconMap = {
  success: <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />,
  warning: <AlertTriangle size={16} className="text-amber-400 shrink-0" />,
  error: <XCircle size={16} className="text-rose-400 shrink-0" />,
  info: <Info size={16} className="text-sky-400 shrink-0" />,
};

const colorMap = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
  error: 'border-rose-500/30 bg-rose-500/10',
  info: 'border-sky-500/30 bg-sky-500/10',
};

export default function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-[340px] w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${colorMap[t.type]}`}
            style={{ background: 'rgba(10,10,10,0.85)' }}
          >
            {iconMap[t.type]}
            <p className="flex-1 text-sm text-white/90 leading-snug">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-white/30 hover:text-white/70 transition-colors mt-0.5"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
