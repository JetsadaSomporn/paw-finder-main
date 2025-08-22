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
    "transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] px-5 whitespace-nowrap flex items-center justify-center text-base";
  const variants = {
    primary:
      "bg-amber-400 text-white rounded-xl py-2 hover:bg-amber-500 focus:ring-amber-300",
    secondary:
      "bg-white text-amber-600 border border-stone-200 rounded-xl py-2 hover:bg-stone-50 focus:ring-amber-300",
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