import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { StarTrackerScene } from "@/components/home/StarTrackerScene";
import { ProofSection } from "@/components/home/ProofSection";
import { TechMarquee } from "@/components/home/TechMarquee";
import { ServicesSection } from "@/components/home/ServicesSection";
import { RoboticArmScene } from "@/components/home/RoboticArmScene";
import { SelectedWork } from "@/components/home/SelectedWork";
import { ProcessSection } from "@/components/home/ProcessSection";
import { CTASection } from "@/components/home/CTASection";
import { PersonJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Tarek Okasha — AI Systems & Custom Software",
  description:
    "Independent engineer in Cairo. AI systems, intelligent automations, and custom software for founders and operators. Currently booking projects starting August 2026.",
};

export default function HomePage() {
  return (
    <>
      <PersonJsonLd />
      <HeroSection />
      <StarTrackerScene />
      <ProofSection />
      <TechMarquee />
      <ServicesSection />
      <RoboticArmScene />
      <SelectedWork />
      <ProcessSection />
      <CTASection />
    </>
  );
}
