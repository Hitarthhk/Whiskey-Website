import type { Metadata } from "next";
import { dusk } from "@/components/landscape/palettes";
import { collection, expressions } from "@/content/site";
import { BottleFeature } from "@/sections/BottleFeature";
import { Collection } from "@/sections/Collection";
import { Contact } from "@/sections/Contact";
import { PageIntro } from "@/sections/PageIntro";

export const metadata: Metadata = {
  title: "Our Whisky — Gamber Valley",
  description: "Private Edition I and The Vault Series: two Gamber Valley Indian single malt expressions.",
};

/** Both expressions side by side, then a dedicated showcase for each. */
export default function WhiskyPage() {
  return (
    <>
      <PageIntro eyebrow={collection.intro} title={collection.heading} palette={dusk} id="whisky-intro" />
      <Collection showCta={false} />
      {expressions.map((e) => (
        <BottleFeature key={e.id} expression={e} />
      ))}
      <Contact />
    </>
  );
}
