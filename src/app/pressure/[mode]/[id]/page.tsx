import Chart from "@/components/Chart";
import RightBar from "@/components/RightBar";
import React from "react"

interface PageProps {
  params: {
    mode: string;
    id: string;
  }
}

function page({ params }: PageProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-7">
        <Chart params={params} />
      </div>

      <div className="hidden lg:block lg:col-span-3 sticky top-20">
        <RightBar />
      </div>
    </div>
  )
}

export default page