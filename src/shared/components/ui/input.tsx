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
          "w-full rounded-xl border border-stone-200 px-4 py-3 text-base text-stone-600 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 transition bg-white",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export default Input;
