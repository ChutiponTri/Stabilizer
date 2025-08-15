"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import React from "react";
import { getCustomers } from "@/actions/user.action";

function RightBar() {
  const [users, setCustomers] = React.useState<string[]>([]);
  React.useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customers = await getCustomers();
        console.log("Fetched customers right bar:", customers);
        setCustomers(customers); // Set the fetched customers in the state
      } catch (error) {
        console.error("Failed to fetch customers", error);
      }
    };
    fetchCustomers(); // Actually call the fetch function
  }, []);

  if (!Array.isArray(users) || users.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <Link href="/getdata">
          <CardTitle className="font-bold">Patients</CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="h-30 overflow-y-auto">
        <div className="space-y-4">
          {users.map((user) => (
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