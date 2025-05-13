import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react"

function page({ params }: { params: { mode: string } }) {
  const modes = ["cervical", "thoracic", "lumbar", "custom"];
  const currentMode = params.mode;
  if (!modes.includes(currentMode)) {
    return notFound();
  }
  return (
    <div>{params.mode}</div>
  )
}

export default page

function notFound() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-7">
        <Card>
          <CardHeader className="text-center pt-4 pb-0">
            Selected Mode is Invalid
          </CardHeader>
          <CardDescription className="text-center pb-4">
            Please Select the Correct Mode
          </CardDescription>
          <CardContent>
            <Button asChild>
              <Link href={"/"} className="mx-2">
                Home
              </Link>
            </Button>
            <Button asChild>
              <Link href={"/"}  className="mx-2">
                Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}