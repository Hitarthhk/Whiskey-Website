import { CanvasTexture, SRGBColorSpace } from "three";

/** Draws the conceptual front label. Clearly marked as a placeholder. */
export function createLabelTexture(liquid = "#c7852b") {
  const W = 1024;
  const H = 820;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  const css = getComputedStyle(document.body);
  const display = css.getPropertyValue("--font-cormorant").trim() || "Georgia, serif";
  const body = css.getPropertyValue("--font-manrope").trim() || "Arial, sans-serif";

  const draw = () => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const paper = ctx.createLinearGradient(0, 0, W, 0);
    paper.addColorStop(0, "#c9bfa9");
    paper.addColorStop(0.5, "#efe7d4");
    paper.addColorStop(1, "#c9bfa9");
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "#a8843f";
    ctx.lineWidth = 3;
    ctx.strokeRect(70, 40, W - 140, H - 80);
    ctx.lineWidth = 1;
    ctx.strokeRect(84, 54, W - 168, H - 108);

    // Mountain mark
    ctx.save();
    ctx.translate(W / 2 - 90, 120);
    ctx.strokeStyle = "#8f6d33";
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(0, 110);
    ctx.lineTo(62, 28);
    ctx.lineTo(86, 58);
    ctx.lineTo(116, 10);
    ctx.lineTo(180, 110);
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = "center";
    ctx.fillStyle = "#14261d";
    ctx.font = `300 112px ${display}`;
    ctx.fillText("GAMBER", W / 2, 360);
    ctx.fillText("VALLEY", W / 2, 470);

    ctx.fillStyle = "#8f6d33";
    ctx.fillRect(W / 2 - 120, 510, 240, 2);

    ctx.fillStyle = "#14261d";
    ctx.font = `500 30px ${body}`;
    if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "10px";
    ctx.fillText("INDIAN SINGLE MALT WHISKY", W / 2, 572);

    ctx.fillStyle = liquid;
    ctx.font = `italic 300 40px ${display}`;
    if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "2px";
    ctx.fillText("Born in the Himalayas", W / 2, 640);

    ctx.fillStyle = "rgba(20,38,29,0.55)";
    ctx.font = `500 18px ${body}`;
    if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "6px";
    ctx.fillText("CONCEPT LABEL — PLACEHOLDER ARTWORK", W / 2, 730);
    texture.needsUpdate = true;
  };

  draw();
  document.fonts?.ready.then(draw).catch(() => {});
  return texture;
}
