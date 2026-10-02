/**
 * Prepares a photo/screenshot for the advisor: decoded, scaled down so the
 * long edge is at most 1600px (numbers in Ads Manager stay readable), and
 * re-encoded as JPEG. Also produces a tiny thumbnail that is safe to keep in
 * the saved chat history.
 */
export interface PreparedImage {
  mimeType: "image/jpeg";
  data: string;
  thumb: string;
}

const MAX_EDGE = 1600;
const THUMB_EDGE = 160;
const MAX_BASE64 = 1_000_000;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("ما گدرت أقرا الصورة. جرّب صورة ثانية."));
    };
    img.src = url;
  });
}

function draw(img: HTMLImageElement, edge: number, quality: number): string {
  const scale = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("المتصفح ما يدعم معالجة الصور.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith("image/")) throw new Error("لازم يكون الملف صورة.");
  if (file.size > 15 * 1024 * 1024) throw new Error("الصورة كبيرة هواية (أكثر من 15MB).");
  const img = await loadImage(file);
  // Three images plus the chat must stay under Vercel's 4.5 MB request limit,
  // so each one is squeezed to ~1 MB of base64 (screenshots stay sharp).
  let full = draw(img, MAX_EDGE, 0.82);
  for (const [edge, q] of [[1280, 0.75], [1024, 0.7], [800, 0.65]] as const) {
    if (full.length <= MAX_BASE64) break;
    full = draw(img, edge, q);
  }
  return { mimeType: "image/jpeg", data: full.split(",")[1], thumb: draw(img, THUMB_EDGE, 0.6) };
}
