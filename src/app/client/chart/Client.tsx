"use client";

import ClientChart from "@/components/ClientChart";
import RightBar from "@/components/RightBar";
import React from "react"

export type ClientProps = {
  mode: string;
  device: string | undefined
  timer: {
    reps: number,
    timer: number,
    rest: number
  }
}

function ClientClient({ mode, timer, device, customers }: ClientProps & { customers: string[]; }) {
  const typedParams: ClientProps = {
    mode: mode,
    device: device,
    timer: timer
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-7">
        <ClientChart params={typedParams} />
      </div>

      <div className="hidden lg:block lg:col-span-3 sticky top-20">
        <RightBar customers={customers} />
      </div>
    </div>
  )
}

export default ClientClient;