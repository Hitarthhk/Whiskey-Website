import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";

const require = createRequire(import.meta.url);
let server, origin, output = "";
before(async () => {
  const socket = createServer();
  await new Promise(resolve => socket.listen(0, "127.0.0.1", resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  origin = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  server.stdout.on("data", data => { output += data; });
  server.stderr.on("data", data => { output += data; });
  for (let attempt = 0; attempt < 120; attempt++) {
    try { if ((await fetch(origin)).ok) return; } catch {}
    if (server.exitCode !== null) throw new Error(output);
    await delay(250);
  }
  throw new Error(`Production server did not become ready: ${output}`);
});
after(async () => {
  if (server && server.exitCode === null) {
    const exited = new Promise(resolve => server.once("exit", resolve));
    server.kill();
    await exited;
  }
});

for (const route of ["/", "/story", "/craft", "/whisky", "/contact", "/terms", "/privacy", "/responsible-drinking"]) {
  test(`production route ${route} serves HTML with usable navigation`, async () => {
    const response = await fetch(origin + route);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/html/);
    const html = await response.text();
    assert.match(html, /<main[^>]*id="main"/);
    assert.match(html, /<h1\b/);
    assert.match(html, /noindex/);
    for (const href of ["/terms", "/privacy", "/responsible-drinking"]) assert.ok(html.includes(`href="${href}"`));
    assert.ok(!html.includes('href="#"'), "Navigation must not contain dead placeholder links");
    if (["/terms", "/privacy", "/responsible-drinking"].includes(route)) {
      assert.ok(!html.includes('role="dialog"'), "Policies must be readable before age confirmation");
      assert.match(html, /Concept preview/);
    }
  });
}

test("reloads show the supplied age-gate background and preload the hero", async () => {
  for (let reload = 0; reload < 2; reload++) {
    const html = await (await fetch(origin + "/")).text();
    const dialog = html.match(/<div[^>]*role="dialog"[^>]*>([\s\S]*?)<\/h1>/)?.[1];
    assert.ok(dialog, "A fresh load must show age verification");
    assert.match(dialog, /Are you of legal drinking age/);
    assert.match(dialog, /src="\/media\/photography\/age-gate-himalaya\.webp"/);
    const preload = (html.match(/<link\b[^>]*>/g) ?? []).find(tag =>
      tag.includes('rel="preload"') && tag.includes('as="image"')
      && tag.includes('/media/photography/hero-himalaya-sunset.webp'));
    assert.ok(preload, "The hero must preload before the visitor confirms");
    assert.doesNotMatch(html, /Remember me on this device/);
  }
  const asset = await fetch(origin + "/media/photography/age-gate-himalaya.webp");
  assert.equal(asset.status, 200);
  assert.match(asset.headers.get("content-type"), /image\/webp/);
});

test("unknown routes return an actual 404", async () => {
  assert.equal((await fetch(origin + "/missing-review-route")).status, 404);
});

test("homepage Origin remains separate from the dedicated Our Story page", async () => {
  const home = await (await fetch(origin + "/")).text();
  const story = await (await fetch(origin + "/story")).text();
  assert.match(home, /id="origin"/);
  for (const title of ["The Foothills", "The Emblem", "The Philosophy"]) assert.ok(home.includes(title));
  for (const scene of ["foothills", "emblem-forest", "philosophy"]) {
    assert.ok(home.includes(`/media/photography/origin-${scene}.webp`));
    assert.ok(!story.includes(`/media/photography/origin-${scene}.webp`));
  }
  assert.match(home, /Conceptual scenery/);
  assert.match(story, /id="story-title"/);
});

test("Our Story keeps its five chapters, quotations, emblem parts and principles", async () => {
  const story = (await (await fetch(origin + "/story")).text()).replace(/<!-- -->/g, "");
  const order = ["The Valley", "The Beginning", "The Landscape", "The Emblem", "The Philosophy"].map((label) => story.indexOf(`<span>${label}</span>`));
  assert.ok(order.every((at, i) => at > 0 && (i === 0 || at > order[i - 1])), "Chapters are missing or out of order");
  // Each quotation is followed by its own speaker and title.
  for (const [quote, name, role] of [
    ["Every generation has a window to build something that outlasts it.", "Romesh Pandita", "Chairman &amp; Managing Director, Alcobrew Distilleries India"],
    ["A brand built to last, not to spike.", "Ashutosh Rajput", "Chief Operating Officer, Alcobrew Distilleries India"],
  ]) {
    const at = story.indexOf(quote);
    assert.ok(at > 0 && story.indexOf(name, at) > at && story.indexOf(role, at) > at, `${name} is not attributed to their quotation`);
    assert.ok(story.indexOf(name, at) - at < 800, `${name} is not set beside their quotation`);
  }
  for (const part of ["The Flower", "Twin Monals", "Crossed Tails", "The Wordmark"]) assert.ok(story.includes(part), part);
  for (const principle of ["Place", "Craft", "Patience", "Identity"]) assert.match(story, new RegExp(`>${principle}</h3>`));
  assert.ok(story.includes("Some places cannot be hurried."));
  assert.ok(story.includes(`href="/media/brand/gamber-valley-emblem.webp"`) || story.includes(`src="/media/brand/gamber-valley-emblem.webp"`), "Original emblem missing");
});

test("the soundscape control is present, muted by default, and credits its recordings", async () => {
  const home = (await (await fetch(origin + "/")).text()).replace(/<!-- -->/g, "");
  assert.match(home, /aria-pressed="false"[^>]*data-on="false"/, "sound must start muted");
  assert.match(home, /Turn the sound of the valley on/);
  for (const scene of ["hero", "breeze"]) assert.match(home, new RegExp(`data-soundscape="${scene}"`), scene);
  assert.match(home, /Sound credits/);
  for (const author of ["Taukeer Alam Lodha", "Shyamal", "Robert EA Harvey", "W.carter"]) assert.ok(home.includes(author), author);
  for (const file of ["wind-woodland", "wind-pines", "dawn-foothills", "call-laughingthrush", "call-barbet"]) {
    const response = await fetch(`${origin}/media/audio/${file}.mp3`);
    assert.equal(response.status, 200, file);
  }
});

test("the retired /collection route permanently redirects to /whisky", async () => {
  const response = await fetch(origin + "/collection", { redirect: "manual" });
  assert.equal(response.status, 308);
  assert.equal(new URL(response.headers.get("location"), origin).pathname, "/whisky");
});

test("primary navigation lists the five pages", async () => {
  const html = await (await fetch(origin + "/")).text();
  for (const href of ["/story", "/craft", "/whisky", "/contact"]) assert.ok(html.includes(`href="${href}"`), href);
});

test("Our Craft, Our Whisky and Contact show the coming-soon invitation", async () => {
  for (const route of ["/craft", "/whisky", "/contact"]) {
    const html = (await (await fetch(origin + route)).text()).replace(/<!-- -->/g, "");
    assert.match(html, /Would love to complete this brand story/, route);
    assert.match(html, /Contact us at <a href="mailto:work@asynk.in">work@asynk.in<\/a> so we can get started with it/, route);
    assert.match(html, /<a href="https:\/\/asynk.in"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*>[\s\S]*?Visit Website/, `${route}: Visit Website`);
    assert.match(html, /<a href="mailto:work@asynk.in"[^>]*>[\s\S]*?Contact Us/, `${route}: Contact Us`);
    assert.doesNotMatch(html, /<form/, `${route}: old content remains`);
  }
});
