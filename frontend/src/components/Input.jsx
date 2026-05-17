import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../utils/cn';

const Input = forwardRef(({ className, icon: Icon, ...props }, ref) => {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Icon size={18} />
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
          "disabled:cursor-not-allowed disabled:opacity-50",
          Icon && "pl-10",
          className
        )}
        {...props}
      />
    </div>
  );
});
Input.displayName = 'Input';
export default Input;