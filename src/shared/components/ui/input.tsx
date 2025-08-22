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
          "w-full rounded-[12px] border border-inputBorder px-4 py-3 text-base text-textPrimary placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition bg-white",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export default Input;
