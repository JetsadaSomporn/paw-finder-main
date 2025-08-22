import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';
import clsx from 'clsx';

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  options: Option[];
  register: UseFormRegister<any>;
  rules?: Record<string, any>;
  error?: FieldError;
  placeholder?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  options,
  register,
  rules,
  error,
  placeholder = 'เลือกพันธุ์แมว'
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-semibold tracking-wide text-stone-600 mb-2 uppercase">
        {label}
      </label>
      <select
        id={name}
        className={clsx(
          'block w-full rounded-lg px-4 py-3 transition-shadow duration-200',
          error
            ? 'border-red-300 text-red-900 focus:ring-2 focus:ring-red-300 focus:border-red-300'
            : 'border-stone-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white/80 backdrop-blur-sm'
        )}
        {...register(name, rules)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

export default FormSelect;