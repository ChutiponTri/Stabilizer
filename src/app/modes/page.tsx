import { redirect } from "next/navigation";
import React from "react";
import ModePageClient from "./ModePageClient";

function page({ searchParams }: { searchParams: Record<string, string | undefined> }) {

  const mode = searchParams.mode;

  if (!mode) redirect("/");

  const check = checkAvailable(mode);
  if (!check) redirect("/");

  return (
    <ModePageClient mode={mode} />
  );
}

export function checkAvailable(mode: string) {
  const available = [
    "cervical extension", "thoracic extention", "thoracic side-shift to right", "thoracic rotation to right",
    "lumbar flexion", "lumbar extension", "lumbar side-shift to right", "lumbar rotation to right", "custom"
  ];
  if (!available.includes(mode.toLowerCase())) {
    return false;
  }
  return true;
}

export default page;
