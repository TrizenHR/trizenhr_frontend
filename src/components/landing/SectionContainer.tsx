import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section';
  id?: string;
}

/**
 * Consistent landing page content width and horizontal padding.
 * Max ~1200px; padding: 16px mobile / 24px tablet / 32px desktop.
 */
export function SectionContainer({
  children,
  className,
  as: Tag = 'div',
  id,
}: SectionContainerProps) {
  return (
    <Tag
      id={id}
      className={cn(
        'mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </Tag>
  );
}

interface SectionHeaderProps {
  label?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SectionHeader({
  label,
  title,
  description,
  align = 'center',
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'max-w-[680px]',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {label ? (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3.5 py-1.5 text-[13px] font-medium text-primary">
          {label}
        </div>
      ) : null}
      <h2
        className={cn(
          'text-[28px] font-bold tracking-tight text-slate-900 sm:text-[36px] lg:text-[40px] lg:leading-[1.15]',
          titleClassName
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-4 text-base leading-relaxed text-slate-500 sm:text-lg',
            descriptionClassName
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
