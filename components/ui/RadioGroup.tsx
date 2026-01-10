"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  options: RadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ label, error, options, value, onValueChange, name, className = "", ...props }, ref) => {
    return (
      <div className={`w-full space-y-1.5 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-900">
            {label}
            {props.required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <label
                key={option.value}
                className={`
                  inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm cursor-pointer transition-colors
                  ${isSelected
                    ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <div
                  className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${isSelected ? "border-[#1e3a5f]" : "border-gray-300"}
                  `}
                >
                  {isSelected && (
                    <div className="w-2 h-2 bg-[#1e3a5f] rounded-full"></div>
                  )}
                </div>
                <input
                  ref={ref}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => onValueChange?.(e.target.value)}
                  className="sr-only"
                  {...props}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export default RadioGroup;
