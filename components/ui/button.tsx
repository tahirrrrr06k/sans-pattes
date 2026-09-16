import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:scale-100 shadow-sm";
  
  const variants = {
    primary: "bg-nature-600 text-white hover:bg-nature-700 shadow-nature-600/20 shadow-md",
    secondary: "bg-cream-200 text-nature-900 hover:bg-cream-300",
    outline: "border-2 border-nature-600 text-nature-700 hover:bg-nature-50",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20",
    ghost: "bg-transparent text-warmgray-800 hover:bg-cream-100 shadow-none",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs font-semibold",
    md: "px-4 py-2.5 text-sm font-semibold",
    lg: "px-6 py-3.5 text-base font-semibold",
    xl: "px-8 py-4 text-lg font-bold shadow-lg",
  };

  return (
    <button
      className={clsx(
        baseStyle,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
