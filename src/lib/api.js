const basicAuth = btoa(
  `${import.meta.env.VITE_API_USERNAME}:${import.meta.env.VITE_API_PASSWORD}`,
);

export async function lookupBank(url) {
  let res;
  try {
    res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/webhook/find-ebanking-provider`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({ bank_url: url }),
      },
    );
  } catch {
    throw new Error("Network error — check your connection and try again.");
  }

  if (!res.ok) {
    if (res.status === 401) throw new Error("Authentication failed — invalid API credentials.");
    if (res.status === 429) throw new Error("Too many requests — please wait a moment and try again.");
    if (res.status >= 500) throw new Error("Server error — the API is temporarily unavailable.");
    throw new Error(`Request failed with status ${res.status}.`);
  }

  const json = await res.json().catch(() => null);
  if (!json) throw new Error("Invalid response from server.");

  if (!json.success) {
    throw new Error(json.data?.message || "Lookup failed — unknown error.");
  }

  const data = json.data;

  // login_urls comes as a comma-separated string — normalize to array
  if (typeof data.login_urls === "string") {
    data.login_urls = data.login_urls.split(",").map((u) => u.trim()).filter(Boolean);
  }

  return data;
}
