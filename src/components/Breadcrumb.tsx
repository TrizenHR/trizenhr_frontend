
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Breadcrumb = ({ children, className, ...props }: BreadcrumbProps) => {
  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb" {...props}>
      <ol className="flex items-center space-x-1 text-sm">
        {children}
      </ol>
    </nav>
  );
};

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
}

export const BreadcrumbItem = ({ children, className, ...props }: BreadcrumbItemProps) => {
  return (
    <li className={cn('flex items-center', className)} {...props}>
      {children}
    </li>
  );
};

export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  isCurrentPage?: boolean;
}

export const BreadcrumbLink = ({ children, className, isCurrentPage, ...props }: BreadcrumbLinkProps) => {
  return (
    <React.Fragment>
      <a
        className={cn(
          'text-gray-600 hover:text-gray-900',
          isCurrentPage && 'font-medium text-gray-900',
          className
        )}
        aria-current={isCurrentPage ? 'page' : undefined}
        {...props}
      >
        {children}
      </a>
      {!isCurrentPage && <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />}
    </React.Fragment>
  );
};
