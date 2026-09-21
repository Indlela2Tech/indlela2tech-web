import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "shortlisted_institutions";

/**
 * Reads the shortlist from localStorage safely.
 * Returns [] if nothing is stored yet, or if storage is unavailable
 * (private browsing, disabled storage, etc).
 */
function readShortlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Could not read shortlist from storage:", err);
    return [];
  }
}

function writeShortlist(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (err) {
    console.error("Could not save shortlist to storage:", err);
    return false;
  }
}

/**
 * useShortlist
 * Manages the student's bookmarked/shortlisted institutions on-device.
 *
 * Usage:
 *   const { shortlist, isShortlisted, toggleShortlist, removeFromShortlist, clearShortlist } = useShortlist();
 *
 * Each institution should at minimum have a unique `id`. Pass the whole
 * institution object in when adding it, so the shortlist page can display
 * name/location/etc without needing to re-fetch anything.
 */
export function useShortlist() {
  const [shortlist, setShortlist] = useState(() => readShortlist());

  // Keep multiple tabs/components in sync if storage changes elsewhere
  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === STORAGE_KEY) {
        setShortlist(readShortlist());
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isShortlisted = useCallback(
    (institutionId) => shortlist.some((item) => item.id === institutionId),
    [shortlist]
  );

  const toggleShortlist = useCallback((institution) => {
    setShortlist((prev) => {
      const exists = prev.some((item) => item.id === institution.id);
      const next = exists
        ? prev.filter((item) => item.id !== institution.id)
        : [...prev, institution];
      writeShortlist(next);
      return next;
    });
  }, []);

  const removeFromShortlist = useCallback((institutionId) => {
    setShortlist((prev) => {
      const next = prev.filter((item) => item.id !== institutionId);
      writeShortlist(next);
      return next;
    });
  }, []);

  const clearShortlist = useCallback(() => {
    setShortlist([]);
    writeShortlist([]);
  }, []);

  return {
    shortlist,
    isShortlisted,
    toggleShortlist,
    removeFromShortlist,
    clearShortlist,
  };
}