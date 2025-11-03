"use client"

import * as React from "react"
import { Label } from "./label"

export interface FormFieldProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({
  label,
  error,
  helperText,
  required,
  children,
}: FormFieldProps) {
  const fieldId = React.useId()

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={fieldId} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-400" : ""}>
          {label}
        </Label>
      )}
      {React.cloneElement(children as React.ReactElement, { id: fieldId })}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-[#a0a0a8]">{helperText}</p>
      )}
    </div>
  )
}


