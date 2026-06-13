import { forwardRef } from 'react';
import { cn } from '../utils/cn';

const Input = forwardRef(({ className, icon: Icon, ...props }, ref) => {
  return (
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-500 transition-colors">
          <Icon size={18} strokeWidth={2.5} />
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "flex h-[46px] w-full rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/50 px-3 py-2 text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium",
          "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm",
          "disabled:cursor-not-allowed disabled:opacity-50",
          Icon && "pl-[42px]",
          className
        )}
        {...props}
      />
    </div>
  );
});
Input.displayName = 'Input';
export default Input;