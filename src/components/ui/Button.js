import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';
const variantStyles = {
    primary: `
    bg-gradient-to-r from-violet-500 to-violet-400
    hover:from-violet-400 hover:to-violet-300
    text-zinc-950 font-semibold
    shadow-lg shadow-violet-500/20
    hover:shadow-violet-500/30
  `,
    secondary: `
    bg-zinc-800 hover:bg-zinc-700
    text-white font-medium
    border border-zinc-700
  `,
    danger: `
    bg-red-600 hover:bg-red-500
    text-white font-medium
  `,
    ghost: `
    bg-transparent hover:bg-zinc-800
    text-zinc-400 hover:text-white
  `,
};
const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
};
export const Button = forwardRef(({ variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, className = '', ...props }, ref) => {
    return (_jsxs("button", { ref: ref, disabled: disabled || isLoading, className: `
          inline-flex items-center justify-center gap-2
          rounded-lg transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `, ...props, children: [isLoading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (leftIcon), children, !isLoading && rightIcon] }));
});
Button.displayName = 'Button';
export default Button;
