'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

const CONTROL =
  'w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground ' +
  'placeholder:text-muted transition-colors ' +
  'focus:outline-2 focus:outline-offset-0 focus:outline-primary disabled:opacity-60';

function shell(error?: string) {
  return cn(CONTROL, error ? 'border-red-500' : 'border-border');
}

interface BaseProps {
  label?: string;
  error?: string;
  hint?: string;
}

/** Wraps a control with its label, hint and inline validation message. */
function Wrapper({
  label,
  error,
  hint,
  id,
  children,
}: BaseProps & { id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Wrapper label={label} error={error} hint={hint} id={fieldId}>
      <input
        id={fieldId}
        aria-invalid={!!error}
        className={cn(shell(error), className)}
        {...props}
      />
    </Wrapper>
  );
}

type TextareaProps = BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Wrapper label={label} error={error} hint={hint} id={fieldId}>
      <textarea
        id={fieldId}
        aria-invalid={!!error}
        className={cn(shell(error), 'min-h-24 resize-y', className)}
        {...props}
      />
    </Wrapper>
  );
}

type SelectProps = BaseProps & React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ label, error, hint, className, id, children, ...props }: SelectProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Wrapper label={label} error={error} hint={hint} id={fieldId}>
      <select
        id={fieldId}
        aria-invalid={!!error}
        className={cn(shell(error), 'h-[38px]', className)}
        {...props}
      >
        {children}
      </select>
    </Wrapper>
  );
}
