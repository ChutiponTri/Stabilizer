import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function checkAvailableMode(mode: string) {
  const available = [
    "cervical flexion", "thoracic extension", "thoracic side-shift to right", "thoracic rotation to right",
    "lumbar flexion", "lumbar extension", "lumbar side-shift to right", "lumbar rotation to right", "custom", "client"
  ];
  if (!available.includes(mode.toLowerCase())) {
    return false;
  }
  return true;
}

const ModeConfig = {
  thoracic: [
    { label: "Thoracic Extension", href: "/modes/thoracic-ext.png", dark: "/modes/thoracic-ext-dark.png" },
    { label: "Thoracic Side-Shift to Right", href: "/modes/thoracic-shift.png", dark: "/modes/thoracic-shift-dark.png" },
    { label: "Thoracic Rotation to Right", href: "/modes/thoracic-rot.png", dark: "/modes/thoracic-rot-dark.png" }
  ],
  lumbar: [
    { label: "Lumbar Flexion", href: "/modes/lumbar-flex.png", dark: "/modes/lumbar-flex-dark.png" },
    { label: "Lumbar Extension", href: "/modes/lumbar-ext.png", dark: "/modes/lumbar-ext-dark.png" },
    { label: "Lumbar Side-Shift to Right", href: "/modes/lumbar-shift.png", dark: "/modes/lumbar-shift-dark.png" },
    { label: "Lumbar Rotation to Right", href: "/modes/lumbar-rot.png", dark: "/modes/lumbar-rot-dark.png" }
  ]
}
