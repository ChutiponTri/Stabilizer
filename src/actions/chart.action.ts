"use server"

import { auth, currentUser } from "@clerk/nextjs/server";
import { getDbFirebase } from "./firebase.action";
import { revalidateTag } from "next/cache";

export async function saveTimer(reps: number, timer: number, rest: number) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return { status: 404, message: "User not found", ok: false };

    try {
      const payload = {
        reps: reps,
        timer: timer,
        rest: rest
      }
      const response = await getDbFirebase(`users/${userId}`, "", "PATCH", payload);
      revalidateTag(`timer-${userId}`);
      return { ok: true };
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return { status: "not ok", message: error, ok: false };
    }
  } catch (error) {
    console.log("Error in syncUser", error);
    return { ok: false };
  }
}

export async function getTimer() {
  const obj = { reps: 3, timer: 20, rest: 10 };

  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return obj

    try {
      const response = await getDbFirebase(`users/${userId}`, "", "GET", null, {
        revalidate: false,
        tags: [`timer-${userId}`]
      });

      if (isObjectWithKeys(response, ["reps", "timer", "rest"])) {
        const payload = {
          reps: Number(response.reps),
          timer: Number(response.timer),
          rest: Number(response.rest)
        }
        return payload;
      }

      await saveTimer(obj.reps, obj.timer, obj.rest);
      return obj;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return obj;
    }
  } catch (error) {
    console.log("Error in syncUser", error);
    return obj;
  }
}

function isObjectWithKeys<T extends string>(
  value: unknown,
  keys: T[]
): value is Record<T, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    keys.every((key) => key in value)
  );
}