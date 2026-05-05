export function resolvePublicApiUrl(raw) {
  const input = typeof raw === "string" ? raw.trim() : "";
  if (!input) return "";

  // On the server keep the original host (often localhost within the same machine).
  if (typeof window === "undefined") return input;

  try {
    const url = new URL(input);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      url.hostname = window.location.hostname;
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    // ignore malformed URLs and fall through
  }

  return input.replace(/\/$/, "");
}

