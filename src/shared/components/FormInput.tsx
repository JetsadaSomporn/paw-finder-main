import React, { ReactNode } from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';
import { motion } from 'framer-motion';

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
      <label htmlFor={name} className="block text-sm font-medium text-stone-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <motion.input
          id={name}
          type={type}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
          className={`
            block w-full rounded-xl bg-white/70 backdrop-blur-sm
            ${icon ? 'pl-12' : 'pl-4'} pr-4 py-2 border shadow-sm
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-stone-200 focus:ring-[#F4A261] focus:border-[#F4A261]'
            }
            transition-colors duration-200
          `}
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