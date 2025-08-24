import React from "react";
import clsx from "clsx";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ className = "", ...props }) => {
  return (
    <textarea
      className={clsx(
        "w-full rounded-xl border border-stone-200 px-4 py-3 text-base text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F4A261] focus:border-[#F4A261] transition bg-white/70 backdrop-blur-sm shadow-sm",
        className
      )}
      {...props}
    />
  );
};

export default Textarea;