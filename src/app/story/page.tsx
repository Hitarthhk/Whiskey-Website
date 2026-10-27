import type { Metadata } from "next";
import { dusk } from "@/components/landscape/palettes";
import { Closing } from "@/sections/Closing";
import { PageIntro } from "@/sections/PageIntro";
import { Story } from "@/sections/Story";

export const metadata: Metadata = { title: "Our Story — Gamber Valley" };

export default function StoryPage() {
  return (
    <>
      <PageIntro eyebrow="Our Story" title="Rooted in Solan" palette={dusk} id="story-intro" />
      <Story />
      <Closing />
    </>
  );
}
