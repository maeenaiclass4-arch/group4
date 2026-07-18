import { useEffect, useRef, useState } from "react";
import type { SaveState } from "@/components/admin/AutosavePill";

export function useAutosave<T>(data: T, onSave: (data: T) => Promise<void>, delay = 900) {
  const [state, setState] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const isFirst = useRef(true);
  const savedTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await onSave(data);
      setState("saved");
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
      savedTimeout.current = setTimeout(() => setState("idle"), 1800);
    }, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);

  return state;
}
