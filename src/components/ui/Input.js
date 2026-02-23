import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
export const Input = forwardRef(({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    return (_jsxs("div", { className: "space-y-2", children: [label && (_jsx("label", { htmlFor: inputId, className: "block text-sm font-medium text-zinc-300", children: label })), _jsx("input", { ref: ref, id: inputId, className: `
            w-full px-4 py-3 
            bg-zinc-900 border rounded-lg
            text-white placeholder-zinc-600
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
            ${error
                    ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                    : 'border-zinc-800 hover:border-zinc-700'}
            ${className}
          `, ...props }), error && (_jsxs("p", { className: "text-sm text-red-400 flex items-center gap-1.5", children: [_jsx("span", { className: "w-1 h-1 bg-red-400 rounded-full" }), error] })), helperText && !error && (_jsx("p", { className: "text-sm text-zinc-500", children: helperText }))] }));
});
Input.displayName = 'Input';
export default Input;
