"use client";

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";

function Modes() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Wait for client-side render
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <SkeletonTime />;

  return (
    <div className="columns-2">
      <div>
        <Link href={{pathname: "/modes", query:{ mode: "Cervical Flexion"}}} className="block" >
          <Card className="w-full mb-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle>Cervical Mode</CardTitle>
              <CardDescription>Choose to Enter Cervical Mode</CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={theme === "dark" ? "/modes/cervical-flex-dark.png" : "/modes/cervical-flex.png"}
                width={500}
                height={500}
                alt="Picture of the cervical"
              />
            </CardContent>
          </Card>
        </Link>

        <Link href={"/modes/lumbar"} className="block">
          <Card className="w-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle>Lumbar Mode</CardTitle>
              <CardDescription>Choose to Enter Lumbar Mode</CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={theme === "dark" ? "/modes/lumbar-flex-dark.png" : "/modes/lumbar-flex.png"}
                width={500}
                height={500}
                alt="Picture of the lummbar"
                priority
              />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div>
        <Link href={"/modes/thoracic"} className="block">
          <Card className="w-full mb-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle>Thoracic Mode</CardTitle>
              <CardDescription>Choose to Enter Thoracic Mode</CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={theme === "dark" ? "/modes/thoracic-ext-dark.png" : "/modes/thoracic-ext.png"}
                width={500}
                height={500}
                alt="Picture of the thoracic"
              />
            </CardContent>
          </Card>
        </Link>

        <Link href={{pathname: "/modes", query:{ mode: "Custom"}}} className="block">
          <Card className="w-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle>Custom Mode</CardTitle>
              <CardDescription>Choose to Enter Customed Mode</CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={theme === "dark" ? "/modes/custom-dark.png" : "/modes/custom.png"}
                width={500}
                height={500}
                alt="custom white"
              />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

function SkeletonTime() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}

export default Modes