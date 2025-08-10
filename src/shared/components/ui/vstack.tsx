import React from 'react';
import { cn } from '../../../lib/utils';

interface VStackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  children: React.ReactNode;
}

const spacingClasses = {
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8',
  none: '',
};

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export const VStack: React.FC<VStackProps> = ({
  spacing = 'md',
  align = 'start',
  justify = 'start',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col',
        spacingClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}; 