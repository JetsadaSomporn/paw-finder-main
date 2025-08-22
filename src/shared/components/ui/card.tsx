import React from "react";
import clsx from "clsx";
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Card: React.FC<CardProps> = ({ className = "", children, ...props }) => {
  return (
    <motion.div
      whileHover={{ translateY: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
      className={clsx(
        "bg-white/80 backdrop-blur-sm rounded-xl border border-stone-100 p-5 md:p-6 transition-transform duration-200",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;