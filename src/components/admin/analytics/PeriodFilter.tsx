/**
 * PeriodFilter — Toggle de 7 / 30 / 90 dias para o dashboard.
 *
 * Segue o padrão visual dos "pills" já usados no admin (como as
 * tabs do AdminProfile): ativo = bg-indigo-600, inativo = muted.
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
    <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60">
      {OPTIONS.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)]/50"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
