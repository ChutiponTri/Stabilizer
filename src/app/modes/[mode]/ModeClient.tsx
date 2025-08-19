"use client";

import { getCustomers } from "@/actions/user.action";
import Create from "@/app/patients/create";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const ModeConfig = {
  thoracic: [
    { label: "Thoracic Extension", href: "/modes/thoracic-ext.png", dark: "/modes/thoracic-ext-dark.png" },
    { label: "Thoracic Side-Shift to Right", href: "/modes/thoracic-shift.png", dark: "/modes/thoracic-shift-dark.png" },
    { label: "Thoracic Rotation to Right", href: "/modes/thoracic-rot.png", dark: "/modes/thoracic-rot-dark.png" }
  ],
  lumbar: [
    { label: "Lumbar Flexion", href: "/modes/lumbar-flex.png", dark: "/modes/lumbar-flex-dark.png" },
    { label: "Lumbar Extension", href: "/modes/lumbar-ext.png", dark: "/modes/lumbar-ext-dark.png" },
    { label: "Lumbar Side-Shift to Right", href: "/modes/lumbar-shift.png", dark: "/modes/lumbar-shift-dark.png" },
    { label: "Lumbar Rotation to Right", href: "/modes/lumbar-rot.png", dark: "/modes/lumbar-rot-dark.png" }
  ]
}

function ModeClient({ mode }: { mode: string }) {
  const validMode = mode as keyof typeof ModeConfig;
  const modes = ModeConfig[validMode];
  const { theme, setTheme } = useTheme();

  const [customers, setCustomers] = React.useState<string[]>([]);
  const [fetching, setFetching] = React.useState<boolean>(true);

  const fetchCustomers = async () => {
    try {
      const customers = await getCustomers(false);
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
      <div className="lg:col-span-7 grid grid-cols-2 gap-2">
        {modes.length > 0 ? (
          modes.map((mode, index) => (
            <div key={index} className="w-full items-center justify-between">
              <Link href={{ pathname: "/modes", query: { mode: mode.label } }} className="w-full" >
                <Card className="w-full h-full mb-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <CardHeader>
                    <CardTitle>{mode.label}</CardTitle>
                    <CardDescription>Select Mode {mode.label}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Image src={theme === "dark" ? mode.dark : mode.href} width={500} height={500} alt="modes" />
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


export default ModeClient;