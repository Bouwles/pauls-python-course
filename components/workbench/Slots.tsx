"use client";

import { createPortal } from "react-dom";
import { useWorkbench } from "./context";

/** Renders a step's hints inside the dialogue box, while the Hint button is down. */
export function InDialogue({ children }: { children: React.ReactNode }) {
  const { hintSlot, hintsOpen } = useWorkbench();
  if (!hintSlot || !hintsOpen) return null;
  return createPortal(children, hintSlot);
}

/** Renders a step's Dennis panel inside the right-hand drawer. */
export function InDrawer({ children }: { children: React.ReactNode }) {
  const { drawerSlot } = useWorkbench();
  if (!drawerSlot) return null;
  return createPortal(children, drawerSlot);
}
