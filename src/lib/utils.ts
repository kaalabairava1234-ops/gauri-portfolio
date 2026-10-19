import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Public files (the CV, icons) live under the site's base path, which is "/"
// locally and on Vercel, and "/gauri-portfolio/" on GitHub Pages.
export const withBase = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
