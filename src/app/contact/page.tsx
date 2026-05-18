import type { Metadata } from "next";
import { ContactPage } from "@/components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a 30-min intro call with Tarek Okasha, or send a project brief. Currently booking projects starting August 2026.",
};

export default function Contact() {
  return <ContactPage />;
}
