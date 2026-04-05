import { create } from 'zustand';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  thumbnail?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 3000 };
    set((state) => ({
      toasts: [...state.toasts.slice(-2), newToast], // max 3
    }));
    setTimeout(() => get().removeToast(id), newToast.duration);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

// Convenience helpers
export const toast = {
  success: (message: string, opts?: { duration?: number; thumbnail?: string }) => useToastStore.getState().addToast({ type: 'success', message, ...opts }),
  warning: (message: string, opts?: { duration?: number; thumbnail?: string }) => useToastStore.getState().addToast({ type: 'warning', message, ...opts }),
  error:   (message: string, opts?: { duration?: number; thumbnail?: string }) => useToastStore.getState().addToast({ type: 'error',   message, ...opts }),
  info:    (message: string, opts?: { duration?: number; thumbnail?: string }) => useToastStore.getState().addToast({ type: 'info',    message, ...opts }),
};
