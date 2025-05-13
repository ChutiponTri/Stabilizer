"use client";

import { UserPlusIcon, HomeIcon, UserIcon, DatabaseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ModeToggle from "./ThemeToggle";
import { useAuth, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { syncUser } from "@/actions/user.action";
import React from "react";

function DesktopNavbar() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  React.useEffect(() => {
    const sync = async () => {
      await syncUser();
    }
    sync();
  }, [])

  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />

      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      {user ? (
        <>
          <Button variant="ghost" className="flex items-center gap-3 justify-start" asChild>
            <Link href="/getdata">
              <DatabaseIcon className="w-4 h-4" />
              Get Data
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/patients">
              <UserPlusIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Patients</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link
              href={`/profile/${user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]
                }`}
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>
          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="default">Sign In</Button>
        </SignInButton>
      )}
    </div>
  );
}
export default DesktopNavbar;