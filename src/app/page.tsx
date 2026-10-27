import { BottleFeature } from "@/sections/BottleFeature";
import { Closing } from "@/sections/Closing";
import { Collection } from "@/sections/Collection";
import { Craft } from "@/sections/Craft";
import { Hero } from "@/sections/Hero";
import { Story } from "@/sections/Story";

export default function Home() {
  return (
    <>
      <Hero />
      <BottleFeature />
      <Story />
      <Craft />
      <Collection />
      <Closing />
    </>
  );
}
