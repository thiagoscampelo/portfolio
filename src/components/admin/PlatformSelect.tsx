/**
 * PlatformSelect — Dropdown customizado para escolher a plataforma de
 * um link social, com ícone de cada opção.
 *
 * Por que não usar `<select>` nativo:
 * - O `<select>` do browser não permite renderizar ícones nas opções
 *   (o SocialIcon não apareceria nos items do dropdown).
 * - Este componente replica a UX de um `<select>` com um `role="listbox"`
 *   acessível.
 *
 * Acessibilidade:
 * - `aria-haspopup="listbox"` + `aria-expanded` no botão.
 * - `role="listbox"` no container das opções.
 * - `role="option"` + `aria-selected` em cada item.
 * - **Teclado completo**:
 *   - Enter / Space / ↓ abrem o dropdown quando fechado
 *   - ↑↓ navegam entre itens
 *   - Home / End vão para o primeiro / último
 *   - Enter / Space selecionam o item destacado
 *   - Esc fecha e devolve foco ao botão
 * - **Clique fora fecha** via `mousedown` no `document`.
 *
 * Comportamento visual:
 * - Ao abrir, o item atual (`value`) é destacado e auto-scrollado para
 *   a viewport do dropdown (`scrollIntoView({ block: "nearest" })`).
 * - Hover do mouse atualiza `highlightedIndex` para manter consistência
 *   entre navegação por teclado e por mouse.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SocialIcon } from "react-social-icons";
import { ChevronDown, Check } from "lucide-react";

interface PlatformSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}

export default function PlatformSelect({
  value,
  onChange,
  options,
  disabled = false,
}: PlatformSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Esc fecha e devolve foco ao botão
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // Ao abrir, destaca a opção selecionada
  useEffect(() => {
    if (!isOpen) return;
    const idx = options.indexOf(value);
    setHighlightedIndex(idx >= 0 ? idx : 0);
  }, [isOpen, options, value]);

  // Garante que o item destacado está visível
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return;
    const el = listRef.current?.children[highlightedIndex] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [isOpen, highlightedIndex]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setHighlightedIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          onChange(options[highlightedIndex]);
          setIsOpen(false);
          buttonRef.current?.focus();
        }
        break;
    }
  }

  function handleSelect(option: string) {
    onChange(option);
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-brand/70 focus:ring-1 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SocialIcon
          as="span"
          network={value}
          style={{ height: 22, width: 22 }}
        />
        <span className="flex-1 text-left">{value}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[var(--color-muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={listRef}
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-64 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl shadow-black/40 p-1.5"
          >
            {options.map((option, index) => {
              const isSelected = option === value;
              const isHighlighted = index === highlightedIndex;
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => handleSelect(option)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    isHighlighted
                      ? "bg-white/[0.04]"
                      : "bg-transparent"
                  } ${
                    isSelected
                      ? "text-[var(--color-foreground)] font-medium"
                      : "text-[var(--color-muted)]"
                  }`}
                >
                  <SocialIcon
                    as="span"
                    network={option}
                    style={{ height: 20, width: 20 }}
                  />
                  <span className="flex-1">{option}</span>
                  {isSelected && (
                    <Check size={14} className="text-brand" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
