import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';

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
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={name}
        className={`
          block w-full rounded-md shadow-sm px-4 py-2 
          ${error 
            ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }
          transition-colors duration-200
        `}
        {...register(name, rules)}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default FormSelect;