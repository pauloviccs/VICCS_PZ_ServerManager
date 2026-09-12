import React, { useState } from "react";
import { FileCode, FileText } from "lucide-react";
import { IniConfigEditor } from "./IniConfigEditor";
import { SandboxConfigEditor } from "./SandboxConfigEditor";

export const ConfigTabsView: React.FC = () => {
  const [subTab, setSubTab] = useState<"ini" | "sandbox">("ini");

  return (
    <div className="space-y-4">
      {/* Sub-navigation bar */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setSubTab("ini")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            subTab === "ini"
              ? "bg-tactical-amber/20 text-tactical-amber border border-tactical-amber/40 font-bold shadow-amber-glow/20"
              : "text-tactical-muted hover:text-white hover:bg-white/5 border border-transparent"
          }`}
        >
          <FileText size={15} />
          <span>GERAL (servertest.ini)</span>
        </button>

        <button
          onClick={() => setSubTab("sandbox")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            subTab === "sandbox"
              ? "bg-tactical-amber/20 text-tactical-amber border border-tactical-amber/40 font-bold shadow-amber-glow/20"
              : "text-tactical-muted hover:text-white hover:bg-white/5 border border-transparent"
          }`}
        >
          <FileCode size={15} />
          <span>SANDBOX & REGRAS (SandboxVars.lua)</span>
        </button>
      </div>

      {subTab === "ini" ? <IniConfigEditor /> : <SandboxConfigEditor />}
    </div>
  );
};
