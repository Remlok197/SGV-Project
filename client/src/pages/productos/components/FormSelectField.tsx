import { ReactNode } from "react";
import { FieldLabel } from "../../../components/ui/field";

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
}

export function FormSelect({ name, label, options, defaultValue, headerAction }: FormSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {/* Contenedor del Label y la Acción (si existe) */}
      <div className="flex justify-between items-center min-h-[24px]">
        <FieldLabel className="text-md font-semibold text-foreground transition-colors duration-200 group-data-[invalid]:text-destructive">
          {label}
        </FieldLabel>
        
        {/* Solo se renderiza si pasas la prop headerAction */}
        {headerAction && (
          <div>{headerAction}</div>
        )}
      </div>
      
      <select 
        name={name} 
        defaultValue={defaultValue}
        className="w-full bg-backgroundInput border border-borderInput text-terciaryText text-sm rounded-lg h-10 px-2"
      > 
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}