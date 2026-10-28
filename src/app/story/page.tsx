import type { Metadata } from "next";
import { preload } from "react-dom";
import { storyPhotos } from "@/content/site";
import { OurStory } from "@/sections/story/OurStory";

export const metadata: Metadata = {
  title: "Our Story — Gamber Valley",
  description: "From the Shivalik foothills of Solan to the emblem and the philosophy of Gamber Valley Indian Single Malt Whisky.",
};

/** Our Story: one continuous film in five chapters. */
export default function StoryPage() {
  preload(storyPhotos.opening.src, { as: "image", fetchPriority: "high" });
  return <OurStory />;
}
