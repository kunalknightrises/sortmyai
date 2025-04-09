import { toast as sonnerToast, type ToastT } from "sonner";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
}

export const toast = ({ title, description, variant = "default" }: ToastProps) => {
  const toastFn = variant === "destructive" ? sonnerToast.error 
    : variant === "success" ? sonnerToast.success
    : variant === "warning" ? sonnerToast.warning
    : sonnerToast;

  toastFn(title, {
    description,
  });
};

export const useToast = () => ({ toast });