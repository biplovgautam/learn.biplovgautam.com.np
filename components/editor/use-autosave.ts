"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

interface UseAutosaveOptions {
  /** A string that changes whenever the saved data changes (e.g. JSON.stringify of fields). */
  signature: string;
  /** Only autosave when this is true (e.g. required fields are filled). */
  enabled: boolean;
  /** Performs the actual create/update. Should throw on failure. */
  onSave: () => Promise<void>;
  /** Idle delay in ms before autosaving. Default 5000. */
  delay?: number;
}

/**
 * Debounced autosave. Waits `delay` ms after the last change, then saves.
 * Skips the initial mount so opening an existing record doesn't trigger a save.
 * Serializes overlapping saves (queues one trailing save if a save is in flight).
 */
export function useAutosave({
  signature,
  enabled,
  onSave,
  delay = 5000,
}: UseAutosaveOptions) {
  const [status, setStatus] = useState<SaveStatus>("idle");

  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const savingRef = useRef(false);
  const pendingRef = useRef(false);
  const firstRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSave = useCallback(async () => {
    if (savingRef.current) {
      pendingRef.current = true;
      return;
    }
    savingRef.current = true;
    setStatus("saving");
    try {
      await onSaveRef.current();
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      savingRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = false;
        void runSave();
      }
    }
  }, []);

  useEffect(() => {
    // Skip the first render so loading existing content isn't an autosave.
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }
    if (!enabled) return;

    setStatus("unsaved");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void runSave();
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [signature, enabled, delay, runSave]);

  /** Flush any pending autosave immediately (used by the manual Save button). */
  const saveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    await runSave();
  }, [runSave]);

  return { status, saveNow };
}
