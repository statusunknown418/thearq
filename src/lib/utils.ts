import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import colors from "tailwindcss/colors";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TAILWIND_PALETTE = [
  colors.emerald[600],
  colors.red[600],
  colors.blue[600],
  colors.yellow[600],
  colors.green[600],
  colors.purple[600],
  colors.pink[600],
  colors.indigo[600],
  colors.violet[600],
  colors.cyan[600],
  colors.teal[600],
  colors.sky[600],
  colors.rose[600],
  colors.gray[600],
] as const;

export const generateRandomColor = () => {
  const index = Math.floor(Math.random() * TAILWIND_PALETTE.length);
  return TAILWIND_PALETTE[index];
};
