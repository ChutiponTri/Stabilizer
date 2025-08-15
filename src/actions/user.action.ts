"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { getDbFirebase } from "./firebase.action";
import { revalidateTag } from "next/cache";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return { status: 404, message: "User not found" };

    try {
      const response = await getDbFirebase(`users/${userId}`, "shallow=true");
      const keys = response && typeof response === "object" ? Object.keys(response) : [];

      // Check if data exists
      if (keys.length > 0) {
        console.log("User Exists");
        return;
      } else {
        // Create a new user in the 'users' node
        const dbUser = {
          name: `${user.firstName || ""} ${user.lastName || ""}`,
          username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
          email: user.emailAddresses[0].emailAddress,
          image: user.imageUrl,
        };
        const updateRef = await getDbFirebase(`users/${userId}`, "", "PUT", dbUser);

        // Return the reference to the newly created user (including the generated key)
        console.log('User created with ID:', dbUser);
        return dbUser;
      }
    } catch (error) {
      console.error('Error checking if user exists:', error);
    }

  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    const response = await getDbFirebase(`users/${clerkId}`);

    // Check if data exists
    if (response) {
      console.log(`Clerk User : ${response}`);
      return response;
    } else {
      return
    }
  } catch (error) {
    console.error('Error checking if user exists:', error);
  }
}

export async function getCustomers() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return [String(userId)];

    try {
      const response = await getDbFirebase(`customers/${userId}`, "shallow=true", "GET", null, {
        revalidate: false,
        tags: [`customer-list-${userId}`]
      });
      const keys = response && typeof response === "object" ? Object.keys(response) : ["Opps"];

      // Check if data exists
      if (keys.length > 0) {
        console.log("Shallow Query:", keys);
        return keys;
      } else {
        console.log("No customers")
        return [];
      }

    } catch (error) {
      console.error('Error checking if user exists:', error);
      return [];
    }
  } catch (error) {
    console.log("Error in syncUser", error);
    return [];
  }
}

export async function getCustomersDetail() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return [];

    try {
      const response = await getDbFirebase(`customers/${userId}`, "shallow=false", "GET", null, {
        revalidate: false,
        tags: [`customers-${userId}`]
      });
      
      return response;

    } catch (error) {
      console.error('Error checking if user exists:', error);
      return [];
    }
  } catch (error) {
    console.log("Error in syncUser", error);
    return [];
  }
}

export async function queryCustomers(id: string) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return { status: 404, message: "User not found" };

    try {
      const response = await getDbFirebase(`customers/${userId}`, "shallow=true");
      const keys = response && typeof response === "object" ? Object.keys(response) : [];

      // Check if data exists
      if (keys.length > 0) {
        const users = await getDbFirebase(`customers/${userId}/${id.toLowerCase()}`);
        return users;
      } else {
        console.log("No customers")
        return;
      }
    } catch (error) {
      console.error('Error checking if user exists:', error);
    }

  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

export async function createCustomer(
  id: string, age: number, gender: string, birth: Date, history: string, weight: number, height: number, bmi: number, waist: number
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return { status: 404, message: "User not found" };

    try {
      const response = await getDbFirebase(`users/${userId}`, "shallow=true");
      const keys = response && typeof response === "object" ? Object.keys(response) : [];

      // Check if data exists
      if (keys.length > 0) {
        const existing = await getDbFirebase(`customers/${userId}/${id.toLowerCase()}`, "shallow=true");
        if (existing && Object.keys(existing).length > 0) return { status: "not ok", message: "Patient already Exist", exist: true };

        const customer = {
          age: age,
          gender: gender,
          birth: birth,
          history: history,
          weight: weight,
          height: height,
          bmi: bmi,
          waist: waist
        };
        const post = await getDbFirebase(`customers/${userId}/${id.toLowerCase()}`, "", "PUT", customer);
        revalidateTag(`customers-${userId}`)
        revalidateTag(`customer-list-${userId}`)
        return { status: "ok", message: "Insert Patient Success" };
      } else {
        console.log("Physiotherapist not exists");
        return { status: "not ok", message: "Cannot Insert" };
      }
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return { status: "not ok", message: error };
    }

  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

export async function adjustCustomer(
  id: string, age: number, gender: string, birth: Date, history: string, weight: number, height: number, bmi: number, waist: number
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return { status: 404, message: "User not found" };

    try {

      const customer = {
          age: age,
          gender: gender,
          birth: birth,
          history: history,
          weight: weight,
          height: height,
          bmi: bmi,
          waist: waist
        };
      const response = await getDbFirebase(`customers/${userId}/${id.toLowerCase()}`, "", "PUT", customer);

      revalidateTag(`customers-${userId}`)
      revalidateTag(`customer-list-${userId}`)
      return { status: "ok", message: "Insert Patient Success" };
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return { status: "not ok", message: error };
    }

  } catch (error) {
    console.log("Error in syncUser", error);
  }
}