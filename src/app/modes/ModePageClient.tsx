"use client";

import { getCustomersDetail } from "@/actions/user.action";
import Create from "@/app/patients/create";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import React from "react";

function ModePageClient({ mode }: { mode: string }) {
  const [customers, setCustomers] = React.useState<Record<string, any>>({});
  const [fetching, setFetching] = React.useState<boolean>(true);

  const fetchCustomers = async () => {
    try {
      const customers = await getCustomersDetail() || [];
      console.log("Fetched customer Mode.tsx", customers);
      setCustomers(customers);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setFetching(false);
    }
  };

  React.useEffect(() => {
    fetchCustomers();
  }, []);

  // Show skeleton loader while fetching
  if (fetching) {
    return <ShowSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-7">
        {Object.entries(customers).length > 0 ? (
          Object.entries(customers).map(([id, data]: [string, any]) => (
            <div key={id} className="flex w-full gap-2 items-center justify-between">
              <Link href={{ pathname: "/pressure", query: { mode, id } }} className="block w-full">
                <Card className="w-full mb-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl">Patient ID: {id}</CardTitle>
                    <CardDescription>{data.gender === "male" ? "👨" : "👩"} {data.age} years old, {data.bmi} BMI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      This patient is a {data.age}-year-old {data.gender} with a height of {data.height} cm and a weight of {data.weight} kg.
                    </p>
                    <p>
                      BMI: {data.bmi}, Waist: {data.waist || "Undefined"} cm — Medical History: {data.history || "Not specified"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))
        ) : (
          <div>
            <Card className="w-full mb-0">
              <CardHeader>
                <CardTitle className="text-xl">No Patient Found</CardTitle>
                <CardDescription>Create New Patient to Continue</CardDescription>
              </CardHeader>
              <CardContent className="pb-5">
                <Create onPatientCreated={fetchCustomers} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="hidden lg:block lg:col-span-3 sticky top-20">
        <ShowRightBar users={customers} />
      </div>
    </div>
  );
}

function ShowSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

function ShowRightBar({ users }: { users: Record<string, any> }) {

  const entries = Object.entries(users);
  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <Link href="/getdata">
          <CardTitle className="font-bold">Patients</CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="h-30 overflow-y-auto">
        <div className="space-y-4">
          {entries.map(([id, user]) => (
            <div key={id} className="flex gap-2 items-center justify-between ">
              Patient {id}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


export default ModePageClient;