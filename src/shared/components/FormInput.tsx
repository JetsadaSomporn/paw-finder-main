import React, { ReactNode } from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';
import clsx from 'clsx';

interface FormInputProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  rules?: Record<string, any>;
  error?: FieldError;
  type?: string;
  placeholder?: string;
  helpText?: string;
  icon?: ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  register,
  rules,
  error,
  type = 'text',
  placeholder,
  helpText,
  icon
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-semibold tracking-wide text-stone-600 mb-2 uppercase">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={name}
          type={type}
          className={clsx(
            `block w-full rounded-lg ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 transition-shadow duration-200`,
            error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-2 focus:ring-red-300 focus:border-red-300 shadow-inner'
              : 'border-stone-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white/70 backdrop-blur-sm shadow-inner'
          )}
          placeholder={placeholder}
          {...register(name, rules)}
        />
      </div>
      {helpText && !error && (
        <p className="mt-1 text-sm text-stone-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default FormInput;