/**
 * Kal Furniture Realtime Synchronization Engine
 * 
 * Provides instantaneous, zero-reload synchronization across:
 * 1. Current tab React Contexts (instant optimistic updates)
 * 2. Cross-tab & Cross-window channels (BroadcastChannel API + storage fallback)
 * 3. Supabase Realtime Postgres Changes (remote database webhooks)
 */

import { getSupabase } from "./supabase";

const CHANNEL_NAME = "kal_furniture_realtime_channel";
const STORAGE_KEY = "kal_realtime_sync_event";

let globalBroadcastChannel = null;

function getBroadcastChannel() {
  if (typeof window === "undefined") return null;
  if (!("BroadcastChannel" in window)) return null;

  if (!globalBroadcastChannel) {
    try {
      globalBroadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch (e) {
      console.warn("[realtimeSync] BroadcastChannel not supported:", e.message);
    }
  }
  return globalBroadcastChannel;
}

/**
 * Broadcast an event to all open browser windows and tabs
 * @param {string} type - Event identifier (e.g. 'HERO_UPDATED', 'PRODUCT_MUTATED')
 * @param {any} payload - Event payload
 */
export function broadcastChange(type, payload = {}) {
  if (typeof window === "undefined") return;

  const eventData = {
    type,
    payload,
    timestamp: Date.now(),
  };

  // 1. Send via BroadcastChannel (instant in-memory IPC between tabs)
  const channel = getBroadcastChannel();
  if (channel) {
    try {
      channel.postMessage(eventData);
    } catch (e) {
      console.warn("[realtimeSync] PostMessage error:", e);
    }
  }

  // 2. Storage event fallback (guaranteed cross-tab event even if BroadcastChannel fails)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventData));
  } catch (e) {
    // Ignore storage quota errors
  }
}

/**
 * Subscribe to cross-tab broadcast events
 * @param {function} callback - Receives { type, payload, timestamp }
 * @returns {function} unsubscribe cleanup function
 */
export function subscribeToBroadcast(callback) {
  if (typeof window === "undefined") return () => {};

  const channel = getBroadcastChannel();

  const handleMessage = (event) => {
    if (event && event.data && callback) {
      callback(event.data);
    }
  };

  const handleStorage = (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        if (callback) callback(data);
      } catch (err) {}
    }
  };

  if (channel) {
    channel.addEventListener("message", handleMessage);
  }
  window.addEventListener("storage", handleStorage);

  return () => {
    if (channel) {
      channel.removeEventListener("message", handleMessage);
    }
    window.removeEventListener("storage", handleStorage);
  };
}

/**
 * Setup Supabase Realtime subscription for database-level live updates
 * @param {object} handlers - { onProductChange, onPackageChange, onSettingsChange }
 * @returns {function} unsubscribe cleanup function
 */
export function initSupabaseRealtime({
  onProductChange,
  onPackageChange,
  onSettingsChange,
} = {}) {
  if (typeof window === "undefined") return () => {};

  const supabase = getSupabase();
  if (!supabase) return () => {};

  try {
    const channelName = `kal-db-realtime-${Math.random().toString(36).slice(2, 8)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          if (onProductChange) onProductChange(payload);
          // Also broadcast to other tabs
          broadcastChange("PRODUCT_MUTATED", payload);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "packages" },
        (payload) => {
          if (onPackageChange) onPackageChange(payload);
          broadcastChange("PACKAGE_MUTATED", payload);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        (payload) => {
          if (onSettingsChange) onSettingsChange(payload);
          broadcastChange("SETTINGS_MUTATED", payload);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[realtimeSync] Connected to Supabase Realtime channel.");
        }
      });

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
  } catch (e) {
    console.warn("[realtimeSync] Failed to initialize Supabase Realtime:", e.message);
    return () => {};
  }
}
