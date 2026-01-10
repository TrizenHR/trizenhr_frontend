'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionContextValue {
  value: string | string[];
  onValueChange: (value: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Accordion({
  type = 'single',
  defaultValue,
  value: controlledValue,
  onValueChange,
  collapsible = true,
  children,
  className,
}: AccordionProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | string[]>(
    defaultValue || (type === 'multiple' ? [] : '')
  );

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback(
    (itemValue: string) => {
      if (type === 'single') {
        const newValue = value === itemValue && collapsible ? '' : itemValue;
        if (isControlled) {
          onValueChange?.(newValue as string);
        } else {
          setUncontrolledValue(newValue);
        }
      } else {
        const currentValue = Array.isArray(value) ? value : [];
        const newValue = currentValue.includes(itemValue)
          ? currentValue.filter((v) => v !== itemValue)
          : [...currentValue, itemValue];
        if (isControlled) {
          onValueChange?.(newValue);
        } else {
          setUncontrolledValue(newValue);
        }
      }
    },
    [value, type, collapsible, isControlled, onValueChange]
  );

  const contextValue = React.useMemo(
    () => ({
      value,
      onValueChange: handleValueChange,
      type,
    }),
    [value, handleValueChange, type]
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn('space-y-1', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  return (
    <div className={cn('border-b border-border', className)} data-value={value}>
      {children}
    </div>
  );
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  value?: string;
}

export function AccordionTrigger({ children, className, value: itemValue }: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error('AccordionTrigger must be used within Accordion');

  const isOpen = React.useMemo(() => {
    if (!itemValue) return false;
    if (context.type === 'single') {
      return context.value === itemValue;
    }
    return Array.isArray(context.value) && context.value.includes(itemValue);
  }, [context.value, context.type, itemValue]);

  const handleClick = () => {
    if (itemValue) {
      context.onValueChange(itemValue);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline cursor-pointer',
        className
      )}
      onClick={handleClick}
    >
      {children}
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
      />
    </div>
  );
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
  value?: string;
}

export function AccordionContent({ children, className, value: itemValue }: AccordionContentProps) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error('AccordionContent must be used within Accordion');

  const isOpen = React.useMemo(() => {
    if (!itemValue) return false;
    if (context.type === 'single') {
      return context.value === itemValue;
    }
    return Array.isArray(context.value) && context.value.includes(itemValue);
  }, [context.value, context.type, itemValue]);

  return (
    <div
      className={cn(
        'overflow-hidden text-sm transition-all',
        isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0',
        className
      )}
    >
      <div className={cn('pb-4 pt-0')}>{children}</div>
    </div>
  );
}
