import React from "react";
import clsx from "clsx";
import { motion } from 'framer-motion';

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
    "transition-all duration-200 ease-in-out font-medium focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 min-h-[44px] px-5 whitespace-nowrap flex items-center justify-center text-base";

  const variants = {
    primary:
      "bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-lg py-2 shadow-sm hover:shadow-md",
    secondary:
      "bg-white text-stone-700 border border-stone-200 rounded-lg py-2 hover:bg-stone-100",
  } as const;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ translateY: -2 }}
      className={clsx(base, variants[variant], className)}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};

export default Button; 