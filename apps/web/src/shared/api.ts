export async function apiJson(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(json?.error ?? `Request failed with ${response.status}`);
  }

  return json;
}

export function withAdminKey(adminKey: string, init?: RequestInit): RequestInit {
  return {
    ...init,
    headers: {
      "X-Admin-Key": adminKey,
      ...init?.headers
    }
  };
}
