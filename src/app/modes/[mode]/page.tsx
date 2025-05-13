"use client";

import Create from "@/app/patients/create";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

function page({ params }: { params: { mode: string } }) {
  const router = useRouter();
  checkAvailable(params.mode, router);

  const [customers, setCustomers] = React.useState<string[]>([]);
  const [fetching, setFetching] = React.useState<boolean>(true);

  const fetchCustomers = async () => {
    try {
      const resp = await fetch("/api/customers");
      const customers = await resp.json();
      setCustomers(customers.customers);
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
        {customers.length > 0 ? (
          customers.map((customer, index) => (
            <div key={index} className="flex w-full gap-2 items-center justify-between">
              <Link href={`/pressure/${params.mode}/${customer}`} className="block w-full" >
                <Card className="w-full mb-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl">Patient {customer}</CardTitle>
                    <CardDescription>Choose to Select Patient</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>Choose to Select Patient {customer}</div>
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
                <Create onPatientCreated={fetchCustomers}/>
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

function ShowRightBar({ users }: { users: string[] }) {

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

function checkAvailable(mode: string, router: ReturnType<typeof useRouter>) {
  const available = ["cervical", "thoracic", "lumbar", "custom"];
    if (!available.includes(mode)) {
    router.replace("/");
  }
}

export default page;
