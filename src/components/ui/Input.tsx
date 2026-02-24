import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zinc-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3 
            bg-zinc-900 border rounded-lg
            text-white placeholder-zinc-600
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500
            ${error
              ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
              : 'border-zinc-800 hover:border-zinc-700'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5">
            <span className="w-1 h-1 bg-red-400 rounded-full" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-zinc-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
