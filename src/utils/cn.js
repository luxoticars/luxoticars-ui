import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Composes class names: clsx for conditionals, tailwind-merge to drop
 * utilities that a later one overrides.
 *
 * Plain JS with a hand-written .d.ts rather than TypeScript, because the
 * package ships unbuilt. A .ts file in node_modules only resolves for
 * consumers running Vite; this resolves everywhere.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
