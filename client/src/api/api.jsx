const API_URL = "http://localhost:4000/api";

// временный user (для демо)
let currentUserId = "381f9ced-27e8-466a-9959-198907e2e09e";

export function setUser(id) {
  currentUserId = id;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": currentUserId,
      ...(options.headers || {}),
    },
  });

  return res.json();
}

export const api = {
  getMe: () => request("/me"),

  getMeetings: () => request("/meetings"),

  getMeeting: (id) => request(`/meetings/${id}`),

  getSummary: (id) => request(`/meetings/${id}/summary`),

  createMeeting: (data) =>
    request("/meetings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteMeeting: (id) =>
    request(`/meetings/${id}`, {
      method: "DELETE",
    }),
};
