import { getCustomers } from "@/actions/user.action";
import { NextResponse } from "next/server";

export async function GET() {
  const customers = await getCustomers();
  return NextResponse.json({ customers });
}