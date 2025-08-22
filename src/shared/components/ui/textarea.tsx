import React from "react";
import clsx from "clsx";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ className = "", ...props }) => {
  return (
    <textarea
      className={clsx(
  "w-full rounded-lg border border-stone-200 px-4 py-3 text-base text-textPrimary placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-shadow duration-200 bg-white/70 backdrop-blur-sm shadow-inner",
        className
      )}
      {...props}
    />
  );
};

export default Textarea;