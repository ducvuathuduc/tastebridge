import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider } from "@/lib/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import { LanguageProvider } from "@/lib/i18n";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Analyze from "@/pages/Analyze";
import Markets from "@/pages/Markets";
import Platform from "@/pages/Platform";
import Partners from "@/pages/Partners";
import Pricing from "@/pages/Pricing";
import Investors from "@/pages/Investors";
import About from "@/pages/About";
import Workspace from "@/pages/Workspace";
import PlanLocalizer from "@/pages/PlanLocalizer";
import Developers from "@/pages/Developers";

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <LanguageProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/analyze" element={<Analyze />} />
                <Route path="/workspace" element={<Workspace />} />
                <Route path="/workspace/:projectId" element={<Workspace />} />
                <Route path="/localize" element={<PlanLocalizer />} />
                <Route path="/developers" element={<Developers />} />
                <Route path="/markets" element={<Markets />} />
                <Route path="/platform" element={<Platform />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/investors" element={<Investors />} />
                <Route path="/about" element={<About />} />
              </Route>
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Router>
        </LanguageProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
