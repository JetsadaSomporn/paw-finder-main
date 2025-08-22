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
    "transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[44px] px-6 whitespace-nowrap flex items-center justify-center text-base";
  const variants = {
    primary:
      "bg-primary text-white rounded-[12px] py-2 hover:bg-[#e85c50]",
    secondary:
      "bg-white text-primary border border-primary rounded-[12px] py-2 hover:bg-secondary",
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