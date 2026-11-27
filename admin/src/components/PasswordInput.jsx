import React, { useState } from "react";

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
        className={`w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputClassName}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
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

