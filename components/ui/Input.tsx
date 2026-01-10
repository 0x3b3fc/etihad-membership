"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isLtr?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, isLtr = false, dir, ...props }, ref) => {
    const inputId = id || props.name;
    const isLtrInput = isLtr || dir === "ltr" || props.type === "email" || props.type === "password" || props.type === "tel" || props.type === "number";

    return (
      <div className="w-full space-y-1.5" dir="rtl">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-900 text-right"
          >
            {label}
            {props.required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          dir={isLtrInput ? "ltr" : "rtl"}
          className={`
            flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm
            transition-colors placeholder:text-gray-400
            focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]
            disabled:cursor-not-allowed disabled:opacity-50
            ${isLtrInput ? "text-left" : "text-right"}
            ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 text-right">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
