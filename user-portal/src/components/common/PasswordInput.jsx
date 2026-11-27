import React, { useState } from "react";

/**
 * Reusable password input with show/hide toggle.
 * Designed for production use with accessible button and consistent styling.
 */
export default function PasswordInput({
  name,
  value,
  onChange,
  placeholder = "Password",
  disabled = false,
  required = false,
  className = "",
  inputClassName = "",
  autoComplete = "current-password",
  onFocus,
  onBlur,
}) {
  const [visible, setVisible] = useState(false);

  const type = visible ? "text" : "password";

  return (
    <div className={`relative ${className}`}>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        required={required}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent outline-none transition-all pr-11 ${inputClassName}`}
      />

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
        tabIndex={disabled ? -1 : 0}
      >
        {/* Simple eye icon (no extra dependency) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {visible ? (
            <>
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-5 0-9.27-3.11-11-7.5a10.71 10.71 0 012.78-4.18" />
              <path d="M6.1 6.1A10.07 10.07 0 0112 4c5 0 9.27 3.11 11 7.5a10.73 10.73 0 01-2.5 3.95" />
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M14.12 14.12A3 3 0 019.88 9.88" />
            </>
          ) : (
            <>
              <path d="M1 12S4 5 12 5s11 7 11 7-3 7-11 7S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}

