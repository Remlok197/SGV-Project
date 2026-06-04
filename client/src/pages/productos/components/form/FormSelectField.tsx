import { ReactNode } from "react";
import { FieldLabel } from "../../../../components/ui/field";
import { ChevronDown } from "lucide-react";

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
  onChange?: (e: any) => void;
}

export function FormSelect({ name, label, options, defaultValue, headerAction, onChange }: FormSelectProps) {
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
      
      <div className="relative flex items-center w-full">
        <select 
          name={name} 
          defaultValue={defaultValue}
          onChange={onChange}
          className="w-full appearance-none bg-backgroundInput border border-borderInput text-terciaryText text-sm rounded-lg h-10 pl-3 pr-10 transition-all duration-200 ease-in-out hover:bg-backgroundInput/80 focus-visible:outline-none focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primaryAction/50 focus-visible:border-primaryAction/50"
        > 
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-terciaryText absolute right-3 pointer-events-none" />
      </div>
    </div>
  );
}