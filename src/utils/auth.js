export function getToken() {
  return (
    window.localStorage.getItem('authToken') ||
    window.localStorage.getItem('adminToken') ||
    null
  );
}

export function decodeToken(token) {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  const token = getToken();
  const payload = decodeToken(token);
  if (!payload) return null;
  return {
    id: payload.sub,
    role: payload.role,
    rawToken: token,
  };
}

