import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className = "",
  children,
  ...props
}) => {
  const base =
    "transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 min-h-[44px] px-6 whitespace-nowrap flex items-center justify-center text-base";
  const variants = {
    primary:
      "bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-11",
    secondary:
      "bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl h-11",
  };
  return (
    <button
      className={clsx(base, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 