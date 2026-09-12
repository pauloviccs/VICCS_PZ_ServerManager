import React from "react";

interface TacticalCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
  icon?: React.ReactNode;
}

export const TacticalCard: React.FC<TacticalCardProps> = ({
  children,
  className = "",
  title,
  subtitle,
  badge,
  headerAction,
  icon,
}) => {
  return (
    <div
      className={`tactical-glass rounded-2xl p-5 relative overflow-hidden transition-all duration-200 border border-white/10 ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
          <div className="flex items-center space-x-3">
            {icon && <div className="text-tactical-amber flex-shrink-0">{icon}</div>}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold tracking-wider uppercase text-tactical-text">
                  {title}
                </h3>
                {badge}
              </div>
              {subtitle && (
                <p className="text-xs text-tactical-muted mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
