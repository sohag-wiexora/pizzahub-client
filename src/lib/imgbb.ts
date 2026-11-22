import { getAuthToken } from "@/lib/api-client";
import { API_BASE_URL, USE_MOCK_DATA } from "@/lib/env";

/**
 * Upload an image and return the hosted URL.
 *
 * The ImgBB API key lives ONLY on the backend (Render .env) — the browser
 * posts the file to the Express API, which pushes it to ImgBB and replies
 * with the public URL. That keeps the secret out of the bundle entirely.
 *
 * Mock mode = no backend yet, so the chosen file is returned as a local
 * data URL — the demo flow still shows exactly the image the user picked.
 */
export async function uploadToImgBB(file: File): Promise<string> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () =>
        reject(new Error("Could not read the selected file"));
      reader.readAsDataURL(file);
    });
  }

  const form = new FormData();
  form.append("image", file);

  // The upload route requires the Bearer JWT (see the Express authenticate
  // middleware). The cross-site session cookie is never sent here, so the
  // request needs the same token the rest of the API client uses.
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE_URL}/api/v1/uploads/image`, {
    method: "POST",
    body: form,
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const json = (await res.json().catch(() => null)) as
    | { url?: string; data?: { url?: string }; message?: string }
    | null;

  if (!res.ok) {
    throw new Error(json?.message ?? "Image upload failed. Please try again.");
  }

  const url = json?.url ?? json?.data?.url;
  if (!url) {
    throw new Error("The server did not return an image URL.");
  }
  return url;
}
