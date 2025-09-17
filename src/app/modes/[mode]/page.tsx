import React from "react"
import ModeClient from "./ModeClient"
import { redirect } from "next/navigation";

export default function page({ params, searchParams }: { params: { mode: string }, searchParams: Record<string, string | undefined> }) {
  const mode = params.mode;
  const isClient = searchParams.isClient === "true";

  const flag = checkAvailable(mode);
  if (!flag || !mode || typeof isClient !== "boolean") return redirect("/");

  return (
    <ModeClient mode={mode} isClient={isClient} />
  )
}

function checkAvailable(mode: string) {
  const available = ["thoracic", "lumbar"];
  if (!available.includes(mode)) {
    return false;
  }
  return true;
}