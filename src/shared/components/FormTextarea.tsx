import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';

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
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        id={name}
        rows={rows}
        className={`
          block w-full rounded-md shadow-sm px-4 py-2 
          ${error 
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }
          transition-colors duration-200
        `}
        placeholder={placeholder}
        {...register(name, rules)}
      ></textarea>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default FormTextarea;