import React, { forwardRef } from 'react';

export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  leftIcon = null,
  rightIcon = null,
  ...props
}, ref) => {
  // Base structural and interactive utility classes
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  // Variant color mappings
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white focus:ring-indigo-500 shadow-sm',
    secondary: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 focus:ring-slate-600 border border-slate-700',
    outline: 'border border-slate-700 hover:bg-slate-800/60 active:bg-slate-800 text-slate-300 focus:ring-slate-500',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white focus:ring-rose-500 shadow-sm',
    ghost: 'hover:bg-slate-800/50 text-slate-300 hover:text-white focus:ring-slate-500'
  };

  // Size variations (padding, font size, gap)
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  };

  // Dynamic spinner color based on button variant
  const spinnerVariants = {
    primary: 'border-white border-t-transparent',
    secondary: 'border-slate-200 border-t-transparent',
    outline: 'border-slate-300 border-t-transparent',
    danger: 'border-white border-t-transparent',
    ghost: 'border-slate-300 border-t-transparent'
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          aria-hidden="true"
          className={`h-4 w-4 border-2 rounded-full animate-spin ${spinnerVariants[variant] || spinnerVariants.primary}`}
        />
      ) : leftIcon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">{leftIcon}</span>
      ) : null}

      <span>{children}</span>

      {!isLoading && rightIcon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">{rightIcon}</span>
      ) : null}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;