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

test("unknown routes return an actual 404", async () => {
  assert.equal((await fetch(origin + "/missing-review-route")).status, 404);
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

test("the contact page offers an enquiry form without claiming it sends", async () => {
  const html = await (await fetch(origin + "/contact")).text();
  assert.match(html, /<form/);
  for (const name of ["name", "email", "type", "message"]) assert.match(html, new RegExp(`name="${name}"`), name);
  assert.match(html, /not yet connected to a submission service/);
  assert.doesNotMatch(html, /has been sent/);
});
