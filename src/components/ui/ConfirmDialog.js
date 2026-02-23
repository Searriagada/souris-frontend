import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
const variantStyles = {
    danger: {
        icon: 'bg-red-500/10 text-red-500',
        button: 'bg-red-600 hover:bg-red-500',
    },
    warning: {
        icon: 'bg-amber-500/10 text-amber-500',
        button: 'bg-amber-600 hover:bg-amber-500',
    },
    info: {
        icon: 'bg-blue-500/10 text-blue-500',
        button: 'bg-blue-600 hover:bg-blue-500',
    },
};
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger', isLoading = false, }) {
    const styles = variantStyles[variant];
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: title, size: "sm", children: _jsxs("div", { className: "flex flex-col items-center text-center py-4", children: [_jsx("div", { className: `w-16 h-16 rounded-full flex items-center justify-center mb-4 ${styles.icon}`, children: _jsx(AlertTriangle, { className: "w-8 h-8" }) }), _jsx("p", { className: "text-zinc-300 mb-6", children: message }), _jsxs("div", { className: "flex gap-3 w-full", children: [_jsx("button", { onClick: onClose, disabled: isLoading, className: "\n              flex-1 px-4 py-3 \n              bg-zinc-800 hover:bg-zinc-700 \n              text-white font-medium rounded-lg\n              transition-colors disabled:opacity-50\n            ", children: cancelText }), _jsx("button", { onClick: onConfirm, disabled: isLoading, className: `
              flex-1 px-4 py-3 
              ${styles.button}
              text-white font-medium rounded-lg
              transition-colors disabled:opacity-50
              flex items-center justify-center gap-2
            `, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), "Procesando..."] })) : (confirmText) })] })] }) }));
}
export default ConfirmDialog;
