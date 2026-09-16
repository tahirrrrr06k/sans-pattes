import React from 'react';
import { clsx } from 'clsx';

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "bg-white rounded-3xl p-5 shadow-sm border border-cream-200 transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md active:scale-[0.99]",
        className
      )}
    >
      {children}
    </div>
  );
};
