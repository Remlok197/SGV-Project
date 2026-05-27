import * as React from "react"
import { ZodType } from "zod"
import { Field, FieldLabel } from "../../../components/ui/field"
import { Input } from "../../../components/ui/input"

interface FormTextFieldProps {
  name: string
  label: string
  placeholder?: string
  type?: string
  step?: string
  schemaField: ZodType
  startContent?: React.ReactNode
  defaultValue?: string
}

export function FormTextField({
  name,
  label,
  placeholder,
  type = "text",
  step,
  schemaField,
  startContent,
  defaultValue,
}: FormTextFieldProps) {
  const [error, setError] = React.useState<string | null>(null)
  const [isFocused, setIsFocused] = React.useState(false)

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    const result = schemaField.safeParse(e.target.value)
    if (!result.success) {
      setError(result.error.issues[0].message)
    } else {
      setError(null)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (error) setError(null) 
  }

  return (
    <Field 
      data-invalid={!!error ? "" : undefined} 
      className="group flex flex-col gap-1.5 w-full relative"
    > 
      <FieldLabel 
        htmlFor={name} 
        className="text-md font-semibold text-foreground transition-colors duration-200 group-data-[invalid]:text-destructive"
      >
        {label}
        <span className="text-destructive ml-1.5 font-bold" aria-hidden="true">*</span>
      </FieldLabel> 
      
      <div className="relative flex items-center">
        {startContent && (
          <span 
            className={`absolute left-3.5 text-sm font-semibold z-10 transition-colors duration-200 pointer-events-none
              ${error ? 'text-destructive' : isFocused ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {startContent}
          </span>
        )}
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          onBlur={handleBlur}
          onFocus={handleFocus}
          aria-invalid={!!error}
          required
          defaultValue={defaultValue}
          className={`rounded-lg transition-all duration-200 ease-in-out
            border-borderInput text-terciaryText font-base  bg-backgroundInput
            
            focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-blue-400/90 focus-visible:border-blue-400/90
            
            ${error ? "!border-destructive focus-visible:!ring-destructive focus-visible:!border-destructive" : ""}
            
            ${startContent ? "pl-8" : ""}
          `}
        />
      </div>

      {error && (
        <span className="text-[13px] font-medium text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {error}
        </span>
      )}
    </Field>
  )
}