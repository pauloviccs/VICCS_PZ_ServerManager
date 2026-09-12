import React from "react";

interface TacticalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "secondary" | "success" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const TacticalButton: React.FC<TacticalButtonProps> = ({
  children,
  variant = "secondary",
  size = "md",
  icon,
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs font-medium rounded-lg space-x-1.5",
    md: "px-4 py-2 text-sm font-medium rounded-xl space-x-2",
    lg: "px-6 py-3 text-base font-semibold rounded-xl space-x-2.5",
  };

  const variantClasses = {
    primary:
      "bg-tactical-amber text-black hover:bg-tactical-amber-hover font-semibold shadow-amber-glow active:scale-[0.98] border border-tactical-amber/50",
    danger:
      "bg-tactical-red/20 text-tactical-red border border-tactical-red/40 hover:bg-tactical-red/30 shadow-red-glow active:scale-[0.98]",
    secondary:
      "bg-white/5 text-tactical-text border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]",
    success:
      "bg-tactical-green/20 text-tactical-green border border-tactical-green/40 hover:bg-tactical-green/30 shadow-green-glow active:scale-[0.98]",
    ghost:
      "text-tactical-muted hover:text-tactical-text hover:bg-white/5 active:scale-[0.98]",
  };

  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
