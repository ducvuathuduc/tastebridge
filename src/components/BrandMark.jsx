export default function BrandMark({ className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-3 w-3 rotate-45 bg-foreground ${className}`}
    />
  );
}