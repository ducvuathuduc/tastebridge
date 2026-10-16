import { useLang } from "@/lib/i18n";
import CardShell from "./CardShell";

export default function ChannelsCard({ channels }) {
  const { t } = useLang();
  return (
    <CardShell label={t("result.channels")}>
      <ol className="space-y-3">
        {(channels || []).map((c, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 font-mono text-xs text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            {c}
          </li>
        ))}
      </ol>
    </CardShell>
  );
}