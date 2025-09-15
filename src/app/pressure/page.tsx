import React from "react"
import { redirect } from "next/navigation"
import PressureClient from "./PressureClient"
import { checkAvailableMode } from "@/lib/utils"
import { getTimer } from "@/actions/chart.action";

async function page({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const mode = searchParams.mode;
  const id = searchParams.id;

  if (!mode || !id) redirect("/")

  const availableMode = checkAvailableMode(mode);

  const timer = await getTimer();
  
  if (!availableMode) redirect("/");

  return (
    <PressureClient mode={mode} id={id} timer={timer}/>
  );
}

export default page