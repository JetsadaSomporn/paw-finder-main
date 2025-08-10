import React from "react";
import clsx from "clsx";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ className = "", ...props }) => {
  return (
    <textarea
      className={clsx(
        "w-full rounded-[12px] border border-inputBorder px-4 py-3 text-base text-textPrimary placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition bg-white",
        className
      )}
      {...props}
    />
  );
};

export default Textarea;