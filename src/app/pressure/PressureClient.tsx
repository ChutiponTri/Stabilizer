"use client";

import Chart from "@/components/Chart"
import RightBar from "@/components/RightBar"
import React from "react"

type TimerProps = {
  reps: number,
  timer: number,
  rest: number
}

export type PageProps = {
  mode: string;
  id: string;
  timer: TimerProps
}

function PressureClient({ mode, id, timer }: { mode: string, id: string, timer: TimerProps}) {
  const typedParams: PageProps = {
    mode: mode,
    id: id,
    timer: timer
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-7">
        <Chart params={typedParams} />
      </div>

      <div className="hidden lg:block lg:col-span-3 sticky top-20">
        <RightBar />
      </div>
    </div>
  )
}

export default PressureClient;