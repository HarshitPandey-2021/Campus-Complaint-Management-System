import React, { useMemo } from "react";

function getStrength(password) {
  const pwd = password || "";
  const checks = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };

  const met = Object.values(checks).filter(Boolean).length;
  const percent = Math.round((met / 4) * 100);

  return { checks, met, percent };
}

export default function PasswordStrengthPanel({ password }) {
  const { checks, percent } = useMemo(() => getStrength(password), [password]);

  const items = [
    { ok: checks.length, label: "At least 8 characters" },
    { ok: checks.upper, label: "1 uppercase letter (A-Z)" },
    { ok: checks.lower, label: "1 lowercase letter (a-z)" },
    { ok: checks.special, label: "1 special symbol (!@#$...)" },
  ];

  const barColor =
    percent === 100
      ? "bg-emerald-500"
      : percent >= 75
      ? "bg-teal-500"
      : percent >= 50
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <div className="w-72 rounded-xl border bg-white shadow-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-900">Password strength</p>
        <span className="text-sm font-bold text-gray-800">{percent}%</span>
      </div>

      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
        <div className={`h-2 ${barColor}`} style={{ width: `${percent}%` }} />
      </div>

      <ul className="space-y-2 text-sm text-gray-700">
        {items.map((it) => (
          <li key={it.label} className="flex items-start gap-2">
            <span
              className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                it.ok
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-500"
              }`}
              aria-hidden="true"
            >
              {it.ok ? "✓" : "•"}
            </span>
            <span className={it.ok ? "text-gray-900" : ""}>{it.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 p-2">
        <p className="text-xs text-gray-600">
          Example: <span className="font-semibold">Campus@2026</span>
        </p>
      </div>
    </div>
  );
}

