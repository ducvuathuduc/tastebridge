export default function CardShell({ label, hint, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-border p-6 ${className}`}>
      {label && (
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      )}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      <div className={label || hint ? "mt-5" : ""}>{children}</div>
    </section>
  );
}