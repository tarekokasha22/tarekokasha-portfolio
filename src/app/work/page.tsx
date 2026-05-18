import type { Metadata } from "next";
import { WorkIndex } from "@/components/work/WorkIndex";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected projects by Tarek Okasha — AI systems, enterprise software, automations. Case studies with real numbers and honest reflections.",
};

export default function WorkPage() {
  return <WorkIndex />;
}
