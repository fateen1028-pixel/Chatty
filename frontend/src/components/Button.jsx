import { forwardRef } from 'react';
import { cn } from '../utils/cn';

const Button = forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
  const variants = {
    primary: "bg-indigo-600 font-semibold text-white hover:bg-indigo-700 hover:shadow-lg shadow-sm transform hover:-translate-y-[1px] active:translate-y-0",
    secondary: "bg-white font-semibold border border-slate-200/80 text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700/80 dark:text-slate-100 dark:hover:bg-slate-700/80 shadow-sm",
    ghost: "text-slate-600 font-medium dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
  };
  const sizes = {
    default: "h-[46px] px-5 py-2.5",
    sm: "h-9 rounded-lg px-4 text-sm",
    icon: "h-[46px] w-[46px] flex justify-center items-center"
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-[#111113] disabled:opacity-50 disabled:pointer-events-none disabled:transform-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = 'Button';
export default Button;