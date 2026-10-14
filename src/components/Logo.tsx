export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#111a2c" />
        <path d="M6 21c3.5-7 16.5-7 20 0" stroke="#e8a33d" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M9 21v-3.2M16 21v-6M23 21v-3.2" stroke="#fbf8f2" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="9.5" r="2.2" fill="#e8a33d" />
      </svg>
      <span className="font-display text-[1.15rem] font-semibold tracking-tight text-ink-900">TasteBridge</span>
    </span>
  );
}
