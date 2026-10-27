import { BottleFeature } from "@/sections/BottleFeature";
import { Collection } from "@/sections/Collection";
import { Contact } from "@/sections/Contact";
import { Hero } from "@/sections/Hero";
import { Story } from "@/sections/Story";
import { origin } from "@/content/site";

/** Hero → Our Origin → Bottle Collection → Individual Bottle Showcase → Contact. */
export default function Home() {
  return (
    <>
      <Hero />
      <Story content={origin} />
      <Collection />
      <BottleFeature />
      <Contact />
    </>
  );
}
