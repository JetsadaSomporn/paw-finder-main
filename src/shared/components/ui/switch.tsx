import React from "react";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, id, ...props }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={e => onCheckedChange(e.target.checked)}
        id={id}
        {...props}
      />
      <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-primary transition relative">
        <div className={
          `absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-4' : ''}`
        } />
      </div>
    </label>
  );
};

export default Switch; 