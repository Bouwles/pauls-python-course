"use client";

// The learner's files for one step: loaded from the local store (or the
// starter, or another step's code), saved on every change, snapshotted on
// every Run and Check.
import { useCallback, useEffect, useRef, useState } from "react";
import type { LocalStore } from "@/lib/store/local";
import { clearConflictNote, getCode, saveCode, snapshot } from "@/lib/store/progress";
import type { SnapshotReason } from "@/lib/store/types";
import type { Files } from "@/lib/python/protocol";

interface Options {
  store: LocalStore | null;
  jobId: string;
  stepId: string;
  files: string[];
  starter: Files;
  /** Start from the learner's code in this step when nothing is saved yet. */
  starterFrom?: string | null;
}

const SAVE_DELAY = 500;

export function useCodeFiles({ store, jobId, stepId, files, starter, starterFrom }: Options) {
  const [contents, setContents] = useState<Files | null>(null);
  const [cursors, setCursors] = useState<Record<string, number | null>>({});
  const [conflict, setConflict] = useState(false);
  const [version, setVersion] = useState(0); // bumps when content is replaced from outside (reset, restore)
  const pending = useRef<Map<string, { content: string; cursor: number | null }>>(new Map());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filesKey = files.join("|");

  useEffect(() => {
    if (!store) return;
    let cancelled = false;
    (async () => {
      const loaded: Files = {};
      const cur: Record<string, number | null> = {};
      let anyConflict = false;
      for (const f of files) {
        const saved = await getCode(store, jobId, stepId, f);
        if (saved) {
          loaded[f] = saved.content;
          cur[f] = saved.cursor;
          anyConflict ||= saved.conflictNote;
        } else if (starterFrom) {
          const from = await getCode(store, jobId, starterFrom, f);
          loaded[f] = from?.content ?? starter[f] ?? "";
        } else {
          loaded[f] = starter[f] ?? "";
        }
      }
      if (!cancelled) {
        setContents(loaded);
        setCursors(cur);
        setConflict(anyConflict);
        setVersion((v) => v + 1);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, jobId, stepId, filesKey, starterFrom]);

  const flush = useCallback(async () => {
    if (!store) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const items = [...pending.current.entries()];
    pending.current.clear();
    for (const [f, { content, cursor }] of items) await saveCode(store, jobId, stepId, f, content, cursor);
  }, [store, jobId, stepId]);

  // Save when leaving the step or the page: locally first, then straight to the server.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "visible" && !pending.current.size) return;
      void flush().then(() => window.dispatchEvent(new Event("ppc:flush-sync")));
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
      void flush();
    };
  }, [flush]);

  const update = useCallback(
    (file: string, content: string, cursor: number | null) => {
      setContents((c) => (c && c[file] === content ? c : { ...(c ?? {}), [file]: content }));
      pending.current.set(file, { content, cursor });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), SAVE_DELAY);
    },
    [flush],
  );

  const takeSnapshot = useCallback(
    async (reason: SnapshotReason) => {
      if (!store || !contents) return;
      await flush();
      for (const f of files) await snapshot(store, jobId, stepId, f, contents[f] ?? "", reason);
    },
    [store, contents, files, jobId, stepId, flush],
  );

  /** Replace a file's content from outside the editor (reset, restore a version, show solution). */
  const replace = useCallback(
    async (file: string, content: string, reason: SnapshotReason = "restore") => {
      if (!store || !contents) return;
      await snapshot(store, jobId, stepId, file, contents[file] ?? "", reason);
      setContents({ ...contents, [file]: content });
      setVersion((v) => v + 1);
      await saveCode(store, jobId, stepId, file, content, null);
    },
    [store, contents, jobId, stepId],
  );

  const dismissConflict = useCallback(async () => {
    if (!store) return;
    setConflict(false);
    for (const f of files) await clearConflictNote(store, jobId, stepId, f);
  }, [store, files, jobId, stepId]);

  return { contents, cursors, update, flush, takeSnapshot, replace, conflict, dismissConflict, version };
}
