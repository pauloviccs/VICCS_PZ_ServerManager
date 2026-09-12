import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface TacticalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const TacticalInput: React.FC<TacticalInputProps> = ({
  label,
  helperText,
  error,
  icon,
  suffix,
  type = "text",
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-tactical-muted">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-tactical-muted pointer-events-none">
            {icon}
          </div>
        )}

        <input
          type={actualType}
          className={`w-full bg-black/40 text-tactical-text placeholder-tactical-muted/50 rounded-xl px-3.5 py-2.5 text-sm border font-mono transition-all duration-150 focus:outline-none ${
            icon ? "pl-10" : ""
          } ${isPassword || suffix ? "pr-10" : ""} ${
            error
              ? "border-tactical-red/60 focus:border-tactical-red focus:ring-1 focus:ring-tactical-red/50"
              : "border-white/10 focus:border-tactical-amber/60 focus:ring-1 focus:ring-tactical-amber/40 hover:border-white/20"
          } ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-tactical-muted hover:text-tactical-text transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {!isPassword && suffix && (
          <div className="absolute right-3 text-tactical-muted pointer-events-none text-xs font-mono">
            {suffix}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-tactical-red font-medium">{error}</p>
      ) : (
        helperText && (
          <p className="text-xs text-tactical-muted">{helperText}</p>
        )
      )}
    </div>
  );
};
