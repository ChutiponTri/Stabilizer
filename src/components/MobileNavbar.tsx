"use client";

import { UserPlusIcon, HomeIcon, LogOutIcon, MenuIcon, MoonIcon, SunIcon, UserIcon, DatabaseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import React from "react";
import { useAuth, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Link from "next/link";
import { syncUser } from "@/actions/user.action";

function MobileNavbar() {
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const { theme, setTheme } = useTheme();
  
  React.useEffect(() => {
    const sync = async () => {
      await syncUser();
    }
    sync();
  }, []);

  return (
    <div className="flex md:hidden items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="mr-2"
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>{user?.fullName}</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4 mt-6">
            <Button variant="ghost" className="flex items-center gap-3 justify-start" asChild>
              <Link href="/">
                <HomeIcon className="w-4 h-4" />
                Home
              </Link>
            </Button>

            {isSignedIn ? (
              <>
                <Button variant="ghost" className="flex items-center gap-3 justify-start" asChild>
                  <Link href="/patients">
                    <UserPlusIcon className="w-4 h-4" />
                    Patients
                  </Link>
                </Button>
                <Button variant="ghost" className="flex items-center gap-3 justify-start" asChild>
                  <Link href="/getdata">
                    <DatabaseIcon className="w-4 h-4" />
                    Get Data
                  </Link>
                </Button>
                <Button variant="ghost" className="flex items-center gap-3 justify-start" asChild>
                  { user ? (
                  <Link href="/profile">
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </Link>
                  ) : (
                  <Link href={"/profile"}>
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </Link>
                  )
                  }
                </Button>
                <SignOutButton>
                  <Button variant="ghost" className="flex items-center gap-3 justify-start w-full">
                    <LogOutIcon className="w-4 h-4" />
                    Logout
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <SignInButton mode="modal">
                <Button variant="default" className="w-full">
                  Sign In
                </Button>
              </SignInButton>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNavbar;