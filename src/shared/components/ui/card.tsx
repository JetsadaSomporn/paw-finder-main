import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Card: React.FC<CardProps> = ({ className = "", children, ...props }) => {
  return (
    <div
      className={clsx(
        "bg-white rounded-2xl shadow-sm border border-stone-200 p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 