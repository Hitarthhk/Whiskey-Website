import type { Metadata } from "next";
import { dawn } from "@/components/landscape/palettes";
import { Closing } from "@/sections/Closing";
import { Craft } from "@/sections/Craft";
import { PageIntro } from "@/sections/PageIntro";

export const metadata: Metadata = { title: "Our Craft — Gamber Valley" };

export default function CraftPage() {
  return (
    <>
      <PageIntro eyebrow="Our Craft" title="Made with patience" palette={dawn} id="craft-intro" />
      <Craft />
      <Closing />
    </>
  );
}
