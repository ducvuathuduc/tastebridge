import Hero from "@/components/landing/Hero";
import ProductDemo from "@/components/landing/ProductDemo";
import HowDiagram from "@/components/landing/HowDiagram";
import FlywheelSection from "@/components/landing/FlywheelSection";
import AgentsGrid from "@/components/landing/AgentsGrid";

export default function Landing() {
  return (
    <div>
      <Hero />
      <ProductDemo />
      <HowDiagram />
      <FlywheelSection />
      <AgentsGrid />
    </div>
  );
}