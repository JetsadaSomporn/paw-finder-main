import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';
import { motion } from 'framer-motion';

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
      <label htmlFor={name} className="block text-sm font-medium text-stone-700 mb-1">
        {label}
      </label>
      <motion.textarea
        id={name}
        rows={rows}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
        className={`
          block w-full rounded-xl bg-white/70 backdrop-blur-sm px-4 py-2 border shadow-sm
          ${error 
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-stone-200 focus:ring-[#F4A261] focus:border-[#F4A261]'
          }
          transition-colors duration-200
        `}
        placeholder={placeholder}
        {...register(name, rules)}
      ></motion.textarea>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default FormTextarea;