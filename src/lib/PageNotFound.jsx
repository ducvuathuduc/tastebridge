import { Link, useLocation } from "react-router-dom";
import { useLang } from "@/lib/i18n";

export default function PageNotFound() {
  const { t } = useLang();
  const location = useLocation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="max-w-md text-center">
        <p className="font-mono text-7xl font-light text-muted-foreground">404</p>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">{t("nf.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          <span className="font-mono">{location.pathname}</span> — {t("nf.sub")}
        </p>
        <Link to="/" className="btn-primary mt-8">
          {t("nf.home")}
        </Link>
      </div>
    </div>
  );
}
