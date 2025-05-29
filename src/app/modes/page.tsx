import { redirect } from "next/navigation";
import React from "react";
import ModePageClient from "./ModePageClient";
import { checkAvailableMode } from "@/lib/utils";

function page({ searchParams }: { searchParams: Record<string, string | undefined> }) {

  const mode = searchParams.mode;

  if (!mode) redirect("/");

  const check = checkAvailableMode(mode);
  if (!check) redirect("/");

  return (
    <ModePageClient mode={mode} />
  );
}

export default page;
