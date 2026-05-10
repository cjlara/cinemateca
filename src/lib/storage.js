const LS_KEY = "cinemateca_v1";

export function loadUserdata() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
  catch { return {}; }
}

export function saveUserdata(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); }
  catch (e) { console.warn("localStorage write failed", e); }
}
