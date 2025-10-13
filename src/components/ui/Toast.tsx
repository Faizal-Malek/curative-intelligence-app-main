"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Toast = {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error'
}

type ToastContextValue = {
  toast: (t: Omit<Toast, 'id'>) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: React.PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newToast: Toast = { id, ...t }
    setToasts((s) => [...s, newToast])
    // auto-dismiss
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 4500)
    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((s) => s.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm w-full rounded-md p-3 shadow-lg border ${
              t.variant === 'error' ? 'bg-red-50 border-red-200' : t.variant === 'success' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
            }`}
            role="status"
            aria-live="polite"
          >
            {t.title && <div className="font-semibold text-sm">{t.title}</div>}
            {t.description && <div className="text-sm text-gray-700 mt-1">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
