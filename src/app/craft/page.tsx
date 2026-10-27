import type { Metadata } from "next";
import { dawn } from "@/components/landscape/palettes";
import { Closing } from "@/sections/Closing";
import { Craft } from "@/sections/Craft";
import { PageIntro } from "@/sections/PageIntro";

export const metadata: Metadata = { title: "Craftsmanship — Gamber Valley" };

export default function CraftPage() {
  return (
    <>
      <PageIntro eyebrow="Craftsmanship" title="Made by hand and season" palette={dawn} id="craft-intro" />
      <Craft />
      <Closing />
    </>
  );
}
