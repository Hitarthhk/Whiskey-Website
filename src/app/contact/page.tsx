import type { Metadata } from "next";
import { EnquiryForm } from "@/components/EnquiryForm";
import { dawn } from "@/components/landscape/palettes";
import { contact } from "@/content/site";
import { Contact } from "@/sections/Contact";
import { PageIntro } from "@/sections/PageIntro";

export const metadata: Metadata = {
  title: "Contact — Gamber Valley",
  description: "Trade, press and partnership enquiries for Gamber Valley Indian Single Malt Whisky.",
};

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow={contact.intro} title={contact.heading} palette={dawn} id="contact-intro" />
      <Contact title="Enquiries">
        <EnquiryForm />
      </Contact>
    </>
  );
}
