import type { Metadata } from "next";
import { AboutPage } from "@/components/about/AboutPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "Tarek Okasha — independent engineer in Cairo. AI systems and custom software for founders and operators. Background, operating principles, and what I'm currently working on.",
};

export default function About() {
  return <AboutPage />;
}
