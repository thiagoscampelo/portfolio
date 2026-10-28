/**
 * PeriodFilter — Toggle de 7 / 30 / 90 dias para o dashboard.
 *
 * Visual: um único grupo com borda hairline e divisórias internas. O item
 * ativo usa apenas fundo verde translúcido + texto verde — sem preenchimento
 * sólido, para não competir com os botões de ação da página.
 */
interface PeriodFilterProps {
  value: number;
  onChange: (days: number) => void;
  disabled?: boolean;
}

const OPTIONS = [
  { label: "7 dias", value: 7 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
];

export default function PeriodFilter({
  value,
  onChange,
  disabled = false,
}: PeriodFilterProps) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-md border border-[var(--color-border)]">
      {OPTIONS.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            disabled={disabled}
            className={`border-r border-[var(--color-border)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors last:border-r-0 ${
              isActive
                ? "bg-brand/[0.08] text-brand"
                : "text-[var(--color-muted)] hover:bg-white/[0.03] hover:text-[var(--color-foreground)]"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
