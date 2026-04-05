'use client';

import { useToastStore } from '@/store/useToastStore';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import styles from './ToastProvider.module.css';

const iconMap = {
  success: <CheckCircle2 size={15} />,
  warning: <AlertTriangle size={15} />,
  error:   <XCircle size={15} />,
  info:    <Info size={15} />,
};

export default function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className={styles.toastContainer}>
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.92 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`${styles.toast} ${styles[t.type]}`}
          >
            {/* Thumbnail */}
            {t.thumbnail && (
              <img
                src={t.thumbnail}
                alt=""
                className={styles.thumbnail}
              />
            )}

            {/* Body: icon + message + close */}
            <div className={styles.body}>
              <span className={`${styles.iconWrapper} ${styles.icon} ${styles[t.type]}`}>
                {iconMap[t.type]}
              </span>
              <p className={styles.message}>{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className={styles.closeBtn}
                aria-label="Đóng thông báo"
              >
                <X size={13} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
