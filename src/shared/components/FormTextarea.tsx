import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';
import clsx from 'clsx';

interface FormTextareaProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  rules?: Record<string, any>;
  error?: FieldError;
  placeholder?: string;
  rows?: number;
}

const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  name,
  register,
  rules,
  error,
  placeholder,
  rows = 4
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-semibold tracking-wide text-stone-600 mb-2 uppercase">
        {label}
      </label>
      <textarea
        id={name}
        rows={rows}
        className={clsx(
          'block w-full rounded-lg px-4 py-3 transition-shadow duration-200',
          error
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-2 focus:ring-red-300 focus:border-red-300'
            : 'border-stone-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white/70 backdrop-blur-sm shadow-inner'
        )}
        placeholder={placeholder}
        {...register(name, rules)}
      ></textarea>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

export default FormTextarea;