import React, { useEffect } from "react";
import { X } from "lucide-react";
import { TacticalButton } from "./TacticalButton";

interface TacticalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
  disablePrimary?: boolean;
}

export const TacticalModal: React.FC<TacticalModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  primaryActionLabel = "Confirmar",
  onPrimaryAction,
  isDestructive = false,
  isLoading = false,
  disablePrimary = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg tactical-glass rounded-2xl overflow-hidden shadow-2xl border ${
          isDestructive
            ? "border-tactical-red/40 shadow-red-glow/20"
            : "border-white/15 shadow-glass"
        } bg-[#0e1014]/90`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            {icon && (
              <div
                className={`p-2 rounded-xl ${
                  isDestructive
                    ? "bg-tactical-red/15 text-tactical-red"
                    : "bg-tactical-amber/15 text-tactical-amber"
                }`}
              >
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold text-tactical-text">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-tactical-muted mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-tactical-muted hover:text-tactical-text hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-black/40 border-t border-white/5">
          <TacticalButton variant="ghost" size="md" onClick={onClose} disabled={isLoading}>
            Cancelar
          </TacticalButton>
          {onPrimaryAction && (
            <TacticalButton
              variant={isDestructive ? "danger" : "primary"}
              size="md"
              onClick={onPrimaryAction}
              isLoading={isLoading}
              disabled={disablePrimary}
            >
              {primaryActionLabel}
            </TacticalButton>
          )}
        </div>
      </div>
    </div>
  );
};
