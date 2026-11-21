"use client";
import { createContext, useContext } from "react";
import { Command, Snapshot } from "@/lib/types";
export interface AppContextType {
  data: Snapshot;
  refresh: () => Promise<void>;
  command: (c: Command) => Promise<{ message: string; id?: string }>;
  notify: (message: string) => void;
  setDirty: (dirty: boolean) => void;
  request: (path: string, body: unknown) => Promise<unknown>;
}
export const AppContext = createContext<AppContextType | null>(null);
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("Missing app context");
  return context;
}
