import React from "react";
import clsx from "clsx";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ className = "", ...props }) => {
  return (
    <textarea
        className={clsx(
        "w-full rounded-xl border border-stone-200 px-4 py-3 text-base text-[#2B2B2B] placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition bg-white",
        className
      )}
      {...props}
    />
  );
};

export default Textarea;