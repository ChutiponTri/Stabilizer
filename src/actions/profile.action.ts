"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDbFirebase } from "./firebase.action";

export async function updateProfile(formData: FormData, username: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;
    
    const format = {
      name: name,
      bio: bio,
      location: location,
      website: website
    }
    const user = await getDbFirebase(`users/${clerkId}`, "", "PATCH", format)
    revalidatePath(`/profile/${username}`);
    return { success: true, user };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}