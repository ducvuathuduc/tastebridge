import { useLang } from "@/lib/i18n";
import StatusBadge from "@/components/StatusBadge";

export default function MarketSwitcher({ markets, selected, onSelect }) {
  const { lang } = useLang();
  return (
    <div className="flex flex-wrap gap-3">
      {markets.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onSelect(m.id)}
          className={`flex h-10 items-center gap-2.5 rounded-md border px-4 text-sm transition-colors ${
            selected === m.id
              ? "border-foreground bg-foreground text-background"
              : "border-border text-foreground hover:border-foreground/40"
          }`}
        >
          {m.name[lang]}
          <StatusBadge live={m.live} />
        </button>
      ))}
    </div>
  );
}