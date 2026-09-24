import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-2xl border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-muted/70 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:opacity-60";

interface FieldProps {
  label?: string;
  hint?: string;
  icon?: ReactNode;
}

export function Field({ label, hint, children, htmlFor }: { label?: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-ink/80">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(function Input(
  { label, hint, icon, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <Field label={label} hint={hint} htmlFor={inputId}>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted [&>svg]:size-[18px]">{icon}</span>}
        <input ref={ref} id={inputId} className={cn(fieldBase, "h-12", icon && "pl-11", className)} {...props} />
      </div>
    </Field>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(function Textarea(
  { label, hint, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <Field label={label} hint={hint} htmlFor={inputId}>
      <textarea ref={ref} id={inputId} className={cn(fieldBase, "min-h-28 resize-y py-3", className)} {...props} />
    </Field>
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(function Select(
  { label, hint, className, id, children, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <Field label={label} hint={hint} htmlFor={inputId}>
      <select ref={ref} id={inputId} className={cn(fieldBase, "h-12 appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10", className)}
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7475' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
});
