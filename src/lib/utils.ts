import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function checkAvailableMode(mode: string) {
  const available = [
    "cervical flexion", "thoracic extention", "thoracic side-shift to right", "thoracic rotation to right",
    "lumbar flexion", "lumbar extension", "lumbar side-shift to right", "lumbar rotation to right", "custom"
  ];
  if (!available.includes(mode.toLowerCase())) {
    return false;
  }
  return true;
}
