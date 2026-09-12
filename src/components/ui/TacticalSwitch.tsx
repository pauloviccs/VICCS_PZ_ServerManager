import React from "react";
import { motion } from "framer-motion";

interface TacticalSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  color?: "amber" | "green";
}

export const TacticalSwitch: React.FC<TacticalSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  color = "amber",
}) => {
  const activeBg = color === "green" ? "bg-tactical-green/30 border-tactical-green/50" : "bg-tactical-amber/30 border-tactical-amber/50";
  const activeGlow = color === "green" ? "shadow-green-glow" : "shadow-amber-glow";
  const activeThumb = color === "green" ? "bg-tactical-green" : "bg-tactical-amber";

  return (
    <label
      className={`flex items-center justify-between space-x-3 cursor-pointer select-none group ${
        disabled ? "opacity-40 pointer-events-none" : ""
      }`}
      onClick={(e) => {
        e.preventDefault();
        if (!disabled) onChange(!checked);
      }}
    >
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <div className="text-sm font-medium text-tactical-text group-hover:text-white transition-colors">
              {label}
            </div>
          )}
          {description && (
            <div className="text-xs text-tactical-muted mt-0.5">{description}</div>
          )}
        </div>
      )}

      <div
        className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 border flex items-center ${
          checked
            ? `${activeBg} ${activeGlow}`
            : "bg-white/5 border-white/10 group-hover:border-white/20"
        }`}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`w-5 h-5 rounded-full shadow-md transition-colors ${
            checked ? `${activeThumb}` : "bg-white/40"
          }`}
          style={{
            marginLeft: checked ? "auto" : "0",
          }}
        />
      </div>
    </label>
  );
};
