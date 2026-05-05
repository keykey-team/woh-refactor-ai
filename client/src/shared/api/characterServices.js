export async function getActiveCharacters() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base || String(base).trim() === "") {
    return {
      ok: false,
      items: [],
      status: 0,
      message: "NEXT_PUBLIC_API_URL не задано",
    };
  }

  const url = `${String(base).replace(/\/$/, "")}/character/characters`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      let message = `Помилка сервера (${response.status})`;
      try {
        const errBody = await response.json();
        if (errBody?.message) {
          message = String(errBody.message);
        }
      } catch {}
      return {
        ok: false,
        items: [],
        status: response.status,
        message,
      };
    }

    const data = await response.json();
    const items = Array.isArray(data?.items)
      ? data.items
      : [];

    return {
      ok: true,
      items,
      status: response.status,
      message: "",
    };
  } catch (e) {
    return {
      ok: false,
      items: [],
      status: 0,
      message:
        e instanceof Error
          ? e.message
          : "Не вдалося завантажити образи",
    };
  }
}
