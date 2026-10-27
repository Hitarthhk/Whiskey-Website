import type { Metadata } from "next";
import { dusk } from "@/components/landscape/palettes";
import { collection } from "@/content/site";
import { Collection } from "@/sections/Collection";
import { PageIntro } from "@/sections/PageIntro";

export const metadata: Metadata = { title: "Our Whisky — Gamber Valley" };

export default function WhiskyPage() {
  return (
    <>
      <PageIntro eyebrow={collection.intro} title={collection.heading} palette={dusk} id="whisky-intro" />
      <Collection showCta={false} />
    </>
  );
}
