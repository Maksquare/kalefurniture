/**
 * Kal Furniture Cookie Utilities
 * Provides reliable client-side and cross-environment cookie management
 * for site settings, hero preferences, cart persistence, and auth tokens.
 */

/**
 * Set a cookie on client-side
 * @param {string} name - Cookie name
 * @param {string|object} value - Cookie value (objects are automatically JSON-stringified)
 * @param {number|object} optionsOrDays - Number of days or options object { days, path, sameSite, secure }
 */
export function setCookie(name, value, optionsOrDays = 30) {
  if (typeof document === "undefined") return;

  let days = 30;
  let path = "/";
  let sameSite = "Lax";
  let secure = typeof window !== "undefined" && window.location.protocol === "https:";

  if (typeof optionsOrDays === "number") {
    days = optionsOrDays;
  } else if (typeof optionsOrDays === "object" && optionsOrDays !== null) {
    if (optionsOrDays.days !== undefined) days = optionsOrDays.days;
    if (optionsOrDays.path !== undefined) path = optionsOrDays.path;
    if (optionsOrDays.sameSite !== undefined) sameSite = optionsOrDays.sameSite;
    if (optionsOrDays.secure !== undefined) secure = optionsOrDays.secure;
  }

  const serialized = typeof value === "object" ? JSON.stringify(value) : String(value);
  const encodedValue = encodeURIComponent(serialized);

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  let cookieString = `${name}=${encodedValue}; path=${path}; expires=${expires.toUTCString()}; SameSite=${sameSite}`;
  if (secure) {
    cookieString += "; Secure";
  }

  document.cookie = cookieString;
}

/**
 * Get a raw cookie string value by name on client-side
 * @param {string} name 
 * @returns {string|null}
 */
export function getCookie(name) {
  if (typeof document === "undefined") return null;

  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      const val = c.substring(nameEQ.length, c.length);
      try {
        return decodeURIComponent(val);
      } catch {
        return val;
      }
    }
  }

  return null;
}

/**
 * Get and safely parse a JSON cookie on client-side
 * @param {string} name 
 * @param {any} defaultValue 
 * @returns {any}
 */
export function getCookieJson(name, defaultValue = null) {
  const val = getCookie(name);
  if (!val) return defaultValue;

  try {
    return JSON.parse(val);
  } catch (e) {
    return val || defaultValue;
  }
}

/**
 * Delete a cookie on client-side
 * @param {string} name 
 * @param {string} path 
 */
export function deleteCookie(name, path = "/") {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

/**
 * Check if a specific cookie exists
 * @param {string} name 
 * @returns {boolean}
 */
export function hasCookie(name) {
  return getCookie(name) !== null;
}
