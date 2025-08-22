import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Card: React.FC<CardProps> = ({ className = "", children, ...props }) => {
  return (
    <div
      className={clsx(
        "bg-card rounded-[20px] shadow-card p-4 md:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 