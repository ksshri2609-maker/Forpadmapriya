const FOLDER = "padmapriya-memories";
const MAX_BYTES = 10 * 1024 * 1024;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
async function sha1Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-1", bytes);
  return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, "0")).join("");
}
async function signature(params, secret) {
  const pairs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return sha1Hex(pairs + secret);
}
function isAdmin(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const supplied = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return !!env.MEMORIES_ADMIN_PASSWORD && safeEqual(supplied, env.MEMORIES_ADMIN_PASSWORD);
}
function cloudinaryReady(env) {
  return env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET;
}
async function cloudinaryList(env) {
  const url = new URL(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/resources/image/upload`);
  url.searchParams.set("prefix", `${FOLDER}/`);
  url.searchParams.set("max_results", "100");
  const auth = btoa(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`);
  const response = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Cloudinary list request failed");
  const memories = (data.resources || []).map(item => ({
    id: item.public_id,
    src: item.secure_url,
    caption: item.context?.custom?.caption || item.public_id.split("/").pop().replace(/[-_]/g, " "),
    createdAt: item.created_at
  })).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return memories;
}
async function uploadPhoto(request, env) {
  if (!isAdmin(request, env)) return json({ error: "Incorrect administrator password." }, 401);
  if (!cloudinaryReady(env)) return json({ error: "Cloudinary secrets are not configured in Worker settings." }, 500);
  const form = await request.formData();
  const file = form.get("photo");
  const caption = String(form.get("caption") || "").trim().slice(0, 120);
  if (!(file instanceof File)) return json({ error: "Choose an image to upload." }, 400);
  if (!file.type.startsWith("image/")) return json({ error: "Only image files are allowed." }, 415);
  if (file.size > MAX_BYTES) return json({ error: "Image is larger than 10 MB. Please choose a smaller photo." }, 413);

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = `${FOLDER}/${crypto.randomUUID()}`;
  const context = caption ? `caption=${caption.replace(/[|=]/g, " ")}` : "";
  const params = { public_id: publicId, timestamp };
  if (context) params.context = context;
  const sig = await signature(params, env.CLOUDINARY_API_SECRET);

  const upload = new FormData();
  upload.append("file", file, file.name || "memory.jpg");
  upload.append("api_key", env.CLOUDINARY_API_KEY);
  upload.append("timestamp", timestamp);
  upload.append("public_id", publicId);
  if (context) upload.append("context", context);
  upload.append("signature", sig);

  const cloudResponse = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST", body: upload
  });
  const data = await cloudResponse.json();
  if (!cloudResponse.ok) return json({ error: data.error?.message || "Cloudinary upload failed." }, 502);
  return json({
    memory: {
      id: data.public_id,
      src: data.secure_url,
      caption: caption || file.name || "A new memory ♡",
      createdAt: data.created_at
    }
  }, 201);
}
async function deletePhoto(request, env, publicId) {
  if (!isAdmin(request, env)) return json({ error: "Incorrect administrator password." }, 401);
  if (!cloudinaryReady(env)) return json({ error: "Cloudinary secrets are not configured." }, 500);
  if (!publicId.startsWith(`${FOLDER}/`)) return json({ error: "This photo cannot be deleted." }, 400);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = { public_id: publicId, timestamp };
  const sig = await signature(params, env.CLOUDINARY_API_SECRET);
  const body = new FormData();
  body.append("public_id", publicId);
  body.append("timestamp", timestamp);
  body.append("api_key", env.CLOUDINARY_API_KEY);
  body.append("signature", sig);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`, {
    method: "POST", body
  });
  const data = await response.json();
  if (!response.ok || data.result !== "ok") return json({ error: data.error?.message || "Cloudinary could not delete this photo." }, 502);
  return json({ success: true });
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/memories" && request.method === "GET") {
        if (!cloudinaryReady(env)) return json({ error: "Cloudinary is not configured yet." }, 500);
        return json({ memories: await cloudinaryList(env) });
      }
      if (url.pathname === "/api/memories/upload" && request.method === "POST") {
        return await uploadPhoto(request, env);
      }
      if (url.pathname.startsWith("/api/memories/") && request.method === "DELETE") {
        const id = decodeURIComponent(url.pathname.slice("/api/memories/".length));
        return await deletePhoto(request, env, id);
      }
      if (url.pathname.startsWith("/api/")) return json({ error: "API route not found." }, 404);
      return env.ASSETS.fetch(request);
    } catch (error) {
      return json({ error: error?.message || "Unexpected server error." }, 500);
    }
  }
};
