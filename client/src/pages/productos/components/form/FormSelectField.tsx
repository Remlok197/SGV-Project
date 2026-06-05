import * as React from "react";
import { ReactNode } from "react";
import { FieldLabel } from "../../../../components/ui/field";
import { ChevronDown } from "lucide-react";
import { ZodType } from "zod";

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  name: string;
  label: string;
  options: Option[];
  defaultValue?: string;
  headerAction?: ReactNode;
  required?: boolean;
  schemaField?: ZodType;
  errorMessage?: string;
  labelClassName?: string;
}

export function FormSelect({ name, label, options, defaultValue, headerAction, onChange, required, schemaField, errorMessage, labelClassName }: FormSelectProps) {
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(errorMessage || null);
  }, [errorMessage]);

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    if (schemaField) {
      const result = schemaField.safeParse(e.target.value);
      if (!result.success) {
        setError(result.error.issues[0].message);
      } else {
        setError(null);
      }
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (error && schemaField) {
      const result = schemaField.safeParse(e.target.value);
      if (result.success) setError(null);
    }
    if (onChange) onChange(e);
  };

  return (
    <div className="flex flex-col gap-1 w-full relative">
      <div className="flex justify-between items-center min-h-[24px]">
        <FieldLabel className={`${labelClassName || "text-md font-semibold text-foreground"} transition-colors duration-200 ${error ? "text-destructive" : ""}`}>
          {label}
          {required && <span className="text-destructive ml-1.5 font-bold" aria-hidden="true">*</span>}
        </FieldLabel>
        
        {headerAction && (
          <div>{headerAction}</div>
        )}
      </div>
      
      <div className="relative flex items-center w-full">
        <select 
          name={name} 
          defaultValue={defaultValue} 
          onChange={handleSelectChange}
          onBlur={handleBlur}
          aria-invalid={!!error}
          className={`w-full appearance-none bg-backgroundInput border border-borderInput text-terciaryText text-sm rounded-lg h-10 pl-3 pr-10 transition-all duration-200 ease-in-out hover:bg-backgroundInput/80 focus-visible:outline-none focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-blue-400/90 focus-visible:border-blue-400/90 ${error ? "!border-destructive focus-visible:!ring-destructive focus-visible:!border-destructive" : ""}`}
        > 
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={(option as any).disabled} hidden={(option as any).hidden}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-terciaryText absolute right-3 pointer-events-none" />
      </div>

      {error && (
        <span className="text-[13px] font-medium text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}