import React from "react"
import { redirect } from "next/navigation"
import { getTimer } from "@/actions/chart.action";
import { getDevice } from "@/actions/data.action";
import { getCustomers } from "@/actions/user.action";
import ClientClient from "./Client";
import { checkAvailableMode } from "@/lib/utils";

async function page({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const mode = searchParams.mode;
  console.log("This it client mode", mode)

  if (!mode) return redirect("/");

  const availableMode = checkAvailableMode(mode);

  if (!availableMode) return redirect("/");

  const timer = await getTimer();

  const result = await getDevice();

  let dev: any | undefined;

  if (result && "device" in result) {
    dev = result.device;
  } else {
    dev = undefined;
  }

  const customers = await getCustomers(false);

  return (
    <ClientClient mode={mode} timer={timer} device={dev} customers={customers} />
  );
}

export default page