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
    "transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#F4A261] focus:ring-offset-2 min-h-[48px] px-6 whitespace-nowrap flex items-center justify-center text-base rounded-xl";
  const variants = {
    primary: "bg-[#F4A261] text-white rounded-xl py-3 hover:bg-[#E8956A]",
    secondary: "bg-white text-[#6C4F3D] border border-stone-200 rounded-xl py-3 hover:bg-stone-50",
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