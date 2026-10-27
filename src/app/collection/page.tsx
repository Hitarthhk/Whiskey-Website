import type { Metadata } from "next";
import { dusk } from "@/components/landscape/palettes";
import { Collection } from "@/sections/Collection";
import { PageIntro } from "@/sections/PageIntro";

export const metadata: Metadata = { title: "The Collection — Gamber Valley" };

export default function CollectionPage() {
  return (
    <>
      <PageIntro eyebrow="The Collection" title="The Expressions" palette={dusk} id="collection-intro" />
      <Collection showCta={false} />
    </>
  );
}
