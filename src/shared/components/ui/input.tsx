import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

/**
 * Input component compatible with react-hook-form's register (forwards ref).
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          "w-full rounded-lg border border-stone-200 px-4 py-3 text-base text-textPrimary placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-shadow duration-200 bg-white/70 backdrop-blur-sm shadow-inner",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export default Input;
