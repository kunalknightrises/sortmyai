import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      expand
      closeButton
      toastOptions={{
        duration: 5000,
        style: {
          background: 'rgb(var(--background))',
          color: 'rgb(var(--foreground))',
          border: '1px solid rgb(var(--border))',
        },
        className: 'font-sans',
      }}
    />
  );
}