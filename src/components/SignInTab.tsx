"use client";

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { Button } from "./ui/button"
import Image from "next/image"
import { useTheme } from "next-themes";

function Signin() {
  const { theme, setTheme } = useTheme();
  return (
    <div  className="lg:col-span-7">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">Stabilizer</CardTitle>
        </CardHeader>
        <CardContent>

          {/* <p className="text-center text-muted-foreground mb-4">
            Login to access your data.
          </p> */}
          <Image 
            src={theme === "dark" ? "/logo/logo-dark.png" : "/logo/logo.png"}
            width={300}
            height={300}
            alt="logo"
            className="mx-auto py-0"
          />
          <SignInButton mode="modal">
            <div className="w-full flex justify-center">
              <Button className="w-full max-w-md" variant="outline">
                Login
              </Button>
            </div>
          </SignInButton>

          <SignUpButton mode="modal">
            <div className="w-full flex justify-center mt-2">
              <Button className="w-full max-w-md" variant="default">
                Sign Up
              </Button>
            </div>
          </SignUpButton>
        </CardContent>
      </Card>
    </div>
  )
}

export default Signin