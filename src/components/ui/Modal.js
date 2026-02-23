import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    const modalRef = useRef(null);
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black/70 backdrop-blur-sm", onClick: onClose }), _jsxs("div", { ref: modalRef, className: `
          relative w-full ${sizeClasses[size]} mx-4
          bg-zinc-900 border border-zinc-800 rounded-xl
          shadow-2xl shadow-black/50
          animate-fade-in
        `, children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-zinc-800", children: [_jsx("h2", { className: "text-lg font-semibold text-white", children: title }), _jsx("button", { onClick: onClose, className: "p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "px-6 py-4 max-h-[90vh] overflow-y-auto", children: children })] })] }));
}
export default Modal;
