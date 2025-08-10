import React from 'react';
import { cn } from '../../../lib/utils';

interface HStackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  children: React.ReactNode;
}

const spacingClasses = {
  xs: 'space-x-1',
  sm: 'space-x-2',
  md: 'space-x-4',
  lg: 'space-x-6',
  xl: 'space-x-8',
  none: '',
};

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export const HStack: React.FC<HStackProps> = ({
  spacing = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex',
        spacingClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}; 