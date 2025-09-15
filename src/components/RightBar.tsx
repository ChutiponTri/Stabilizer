"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import React from "react";
import { getCustomers } from "@/actions/user.action";

function RightBar({ customers }: { customers: string[] }) {

  if (!Array.isArray(customers) || customers.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <Link href="/getdata">
          <CardTitle className="font-bold">Patients</CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="h-30 overflow-y-auto">
        <div className="space-y-4">
          {customers.map((user) => (
            <div key={user} className="flex gap-2 items-center justify-between ">
              Patient {user}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
export default RightBar;