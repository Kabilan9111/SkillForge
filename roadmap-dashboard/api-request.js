// ============================================================
// SKILLFORGE — Global Authenticated API Request Helper
// All frontend API calls should use apiRequest() so that the
// JWT token is always attached and 401 responses are handled
// consistently across every module.
// ============================================================

/**
 * Make an authenticated API request.
 * Automatically injects the Bearer token from localStorage.
 * Redirects to /login on 401 Unauthorized.
 *
 * @param {string}  url          - API endpoint URL
 * @param {object}  [options={}] - Standard fetch() options
 * @returns {Promise<Response>}
 */
function apiRequest(url, options = {}) {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');

  const mergedHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    mergedHeaders['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers: mergedHeaders,
  }).then(function handleAuth(response) {
    if (response.status === 401) {
      // Token missing or expired — clear storage and go to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      const reason = encodeURIComponent('session_expired');
      const next   = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.replace('/login.html?reason=' + reason + '&next=' + next);
      // Return a never-resolving promise so callers don't see partial data
      return new Promise(function () {});
    }
    return response;
  });
}

/**
 * Convenience wrapper — POST JSON and return parsed response body.
 * Throws on non-2xx status codes.
 *
 * @param {string} url
 * @param {object} body
 * @param {object} [extraOptions={}]
 * @returns {Promise<any>}
 */
apiRequest.postJSON = async function postJSON(url, body, extraOptions = {}) {
  const res = await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    ...extraOptions,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || data.message || 'Request failed'), { status: res.status, data });
  return data;
};

/**
 * Convenience wrapper — GET and return parsed response body.
 * Throws on non-2xx status codes.
 *
 * @param {string} url
 * @param {object} [extraOptions={}]
 * @returns {Promise<any>}
 */
apiRequest.getJSON = async function getJSON(url, extraOptions = {}) {
  const res = await apiRequest(url, { method: 'GET', ...extraOptions });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || data.message || 'Request failed'), { status: res.status, data });
  return data;
};

/**
 * Log out the current user — clear tokens and redirect to /login.
 */
apiRequest.logout = function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  localStorage.removeItem('userEmail');
  window.location.replace('/login.html');
};

// ── Expose on window so every script can use it ──────────────────────────────
if (typeof window !== 'undefined') {
  window.apiRequest = apiRequest;
}

// ── CommonJS export for Node.js test environments ───────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = apiRequest;
}
