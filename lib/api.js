const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

let refreshPromise = null;

export async function refreshAccessToken() {
  if (typeof window === "undefined") return null;
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "same-origin",
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data?.accessToken) return null;
      localStorage.setItem("token", data.accessToken);
      return data;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}/api${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (error) {
    throw new Error(
      "Network error. Please check your connection and try again."
    );
  }

  if (response.status === 401 && typeof window !== "undefined") {
    const refreshData = await refreshAccessToken();
    if (refreshData) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${refreshData.accessToken}`,
      };
      try {
        response = await fetch(url, config);
      } catch (error) {
        throw new Error(
          "Network error. Please check your connection and try again."
        );
      }
    }
  }

  let text;
  try {
    text = await response.text();
  } catch (error) {
    throw new Error(
      "Network error. Please check your connection and try again."
    );
  }

  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(
      (data && (data.error || data.message)) || "Something went wrong"
    );
  }

  return data;
}

export function get(endpoint) {
  return apiRequest(endpoint, { method: "GET" });
}

export function post(endpoint, body) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function put(endpoint, body) {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function del(endpoint) {
  return apiRequest(endpoint, { method: "DELETE" });
}
