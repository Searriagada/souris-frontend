import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const variantStyles = {
  danger: {
    icon: 'bg-red-500/10 text-red-500',
    button: 'bg-red-600 hover:bg-red-500',
  },
  warning: {
    icon: 'bg-pink-500/10 text-pink-500',
    button: 'bg-pink-600 hover:bg-pink-500',
  },
  info: {
    icon: 'bg-blue-500/10 text-blue-500',
    button: 'bg-blue-600 hover:bg-blue-500',
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center py-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${styles.icon}`}>
          <AlertTriangle className="w-8 h-8" />
        </div>
        <p className="text-zinc-300 mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="
              flex-1 px-4 py-3 
              bg-zinc-800 hover:bg-zinc-700 
              text-white font-medium rounded-lg
              transition-colors disabled:opacity-50
            "
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              flex-1 px-4 py-3 
              ${styles.button}
              text-white font-medium rounded-lg
              transition-colors disabled:opacity-50
              flex items-center justify-center gap-2
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
