import { IMGBB_API_KEY } from "@/lib/env";

/**
 * Upload an image file to ImgBB and return the hosted URL.
 * ImgBB is required for menu-item images; the API key is safe to use
 * from the browser (documented in the assignment).
 */
export async function uploadToImgBB(file: File): Promise<string> {
  if (!IMGBB_API_KEY) {
    // Mock mode has no key configured — fall back to a deterministic
    // placeholder so the flow stays demoable end to end.
    await new Promise((r) => setTimeout(r, 600));
    const seed = encodeURIComponent(file.name.replace(/\.[^.]+$/, ""));
    return `https://placehold.co/900x600/1b3a2a/e8c87e?text=${seed}`;
  }

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1)); // strip data:image/...;base64,
    };
    reader.onerror = () => reject(new Error("Could not read the selected file"));
    reader.readAsDataURL(file);
  });

  const form = new FormData();
  form.append("image", base64);

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    { method: "POST", body: form },
  );
  const json = await res.json();
  if (!res.ok || !json?.data?.url) {
    throw new Error(json?.error?.message ?? "Image upload failed. Try again.");
  }
  return json.data.url as string;
}
