import type { Metadata } from "next";
import { dawn } from "@/components/landscape/palettes";
import { contact } from "@/content/site";
import { Closing } from "@/sections/Closing";
import { PageIntro } from "@/sections/PageIntro";

export const metadata: Metadata = { title: "Contact — Gamber Valley" };

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow={contact.intro} title={contact.heading} palette={dawn} id="contact-intro" />
      <Closing />
    </>
  );
}
