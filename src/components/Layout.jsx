import { Outlet } from "react-router-dom";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="pt-16 print:pt-0">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}