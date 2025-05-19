"use client";

import Chart from "@/components/Chart";
import RightBar from "@/components/RightBar";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react"

type PageProps = {
  mode: string;
  id: string;
}

function page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = {
    mode: searchParams.get("mode"),
    id: searchParams.get("id")
  }

  if (!params.mode || !params.id) return router.push("/")

  const typedParams: PageProps = {
    mode: params.mode,
    id: params.id,
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

export default page