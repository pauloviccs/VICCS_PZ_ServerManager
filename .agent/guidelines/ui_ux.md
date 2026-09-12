# Diretrizes de UI/UX — "Tactical Glass"

## Filosofia Visual
Combinação da precisão e clareza do design da Apple (espaçamentos generosos, liquid glass, cantos arredondados) com a estética de painel tático militar de *Escape from Tarkov* (alto contraste, dados densos organizados, tipografia técnica, acentos fosforescentes).

## Regras Inegociáveis
1. **Zero Emojis:** Proibido o uso de emojis na interface. Toda semântica deve usar ícones vetoriais de `lucide-react`.
2. **Tactical Glass:**
   - Cards e painéis com `backdrop-filter: blur(16px)`.
   - Fundo translúcido: `rgba(255, 255, 255, 0.04)` a `0.07`.
   - Borda de 1px translúcida (`rgba(255, 255, 255, 0.10)`) com leve gradiente de brilho superior.
   - Cantos arredondados: cards grandes (16-24px), botões e inputs (10-12px).
3. **Cores Semânticas:**
   - Fundo: Quase preto com leve tom petróleo/oliva (`#0B0D0C` / `#12141A`).
   - Acento Primário: Âmbar Tático (`#E4A94A`).
   - Acento de Sucesso / Online: Verde Fosforescente (`#7CFFB2`).
   - Acento de Perigo / Destrutivo: Vermelho Translúcido (`#FF5C5C`).
   - Texto: Branco acinzentado (`#E8EAED`) para conforto visual.
4. **Tipografia:**
   - Interface Geral: `Inter` ou `Sora`.
   - Dados Técnicos, Logs, IDs e Métricas: `JetBrains Mono`.
5. **Componentes Padronizados:**
   - Toggles: Switch em pílula única com transição de cor e glow suave.
   - Modais: Template centralizado de vidro, cabeçalho padronizado (ícone + título + fechar) e ações no rodapé à direita.
   - Ações Destrutivas (Wipe / Shutdown): Exigem digitação obrigatória de `CONFIRMAR` em caixa alta.
