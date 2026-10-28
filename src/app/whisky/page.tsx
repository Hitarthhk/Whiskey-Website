import type { Metadata } from "next";
import { ComingSoon } from "@/sections/ComingSoon";

export const metadata: Metadata = { title: "Our Whisky — Gamber Valley" };

export default function Page() {
  return <ComingSoon page="Our Whisky" />;
}
