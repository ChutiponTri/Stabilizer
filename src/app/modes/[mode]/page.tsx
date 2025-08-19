import React from "react"
import ModeClient from "./ModeClient"
import { redirect } from "next/navigation";

export default function page({ params }: { params: { mode: string } }) {
  const mode = params.mode;
  const flag = checkAvailable(mode);
  if (!flag || !mode) return redirect("/");
  
  return (
    <ModeClient mode={mode}/>
  )
}

function checkAvailable(mode: string) {
  const available = ["thoracic", "lumbar"];
  if (!available.includes(mode)) {
    return false;
  }
  return true;
}