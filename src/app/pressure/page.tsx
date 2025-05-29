import { redirect } from "next/navigation";
import React from "react"
import PressureClient from "./PressureClient";
import { checkAvailable } from "../modes/page";

function page({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const mode = searchParams.mode;
  const id = searchParams.id;

  if (!mode || !id) redirect("/")

  const availableMode = checkAvailable(mode);
  
  if (!availableMode) redirect("/");

  return (
    <PressureClient mode={mode} id={id} />
  )
}

export default page