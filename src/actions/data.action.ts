"use server";

import { PressureData } from "@/components/Chart";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getDbFirebase } from "./firebase.action";
import { Query } from "@/components/Query";
import { revalidateTag } from "next/cache";

export async function storeData(data: PressureData) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const id = data.patient;
    const mode = data.mode;
    const start = data.start?.replace(/\//g, "-");
    console.log(id, start);
    if (!id) return { status: "not ok", message: "Missing Patient ID" };
    if (!start) return { status: "not ok", message: "Missing Patient Start Time" };
    if (!mode) return { status: "not ok", message: "Missing Operation Mode" };
    if (!userId || !user) return { status: 404, message: "User not found" };

    try {
      const response = await getDbFirebase(`users/${userId}`, "shallow=true");
      const keys = response && typeof response === "object" ? Object.keys(response) : [];

      // Check if data exists
      if (keys.length > 0) {
        const datatoSave = {
          timestamp: data.timestamp,
          pressure: data.pressure
        };
        const post = await getDbFirebase(`data/${userId}/${id.toLowerCase()}/${mode}_${start}`, "", "POST", datatoSave);
        console.log("Posted");
        return { status: "ok", message: "Insert Data Success" };
      } else {
        console.log("Physiotherapist not exists");
        return { status: "not ok", message: "Cannot Insert Data" };
      }
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return { status: "not ok", message: error };
    }

  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

export async function getDataChoice(patientId: string | undefined) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const id = patientId;

    if (!userId || !user) return { status: 404, message: "User not found" };
    if (!id) return { status: 404, message: "Patient ID not found" };

    try {
      const response = await getDbFirebase(`customers/${userId}/${id}`, "shallow=true");
      const keys = response && typeof response === "object" ? Object.keys(response) : [];

      // Check if data exists
      if (keys.length > 0) {
        const users = await getDbFirebase(`data/${userId}/${id.toLowerCase()}`, "shallow=true");
        const keys = users && typeof users === "object" ? Object.keys(users) : [];
        console.log(`Data Exist ${keys}`);
        return keys;
      } else {
        console.log("No Data")
        return;
      }
    } catch (error) {
      console.error('Error Qeury Data:', error);
    }

  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

export async function getDataRaw(input: Query) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const id = input.id;
    const dataName = input.dataName;

    if (!userId || !user) return { status: 404, message: "User not found" };

    try {
      const response = await getDbFirebase(`customers/${userId}/${id}`, "shallow=true");
      const keys = response && typeof response === "object" ? Object.keys(response) : [];

      // Check if data exists
      if (keys.length > 0) {
        const data = await getDbFirebase(`data/${userId}/${id.toLowerCase()}/${dataName}`);
        if (data && typeof data === "object") {
          const value = Object.values(data);
          console.log(`Raw Data Exist ${value}`);
          return value;
        }
        return [];
      } else {
        console.log("No Data")
        return;
      }
    } catch (error) {
      console.error('Error Qeury Data:', error);
    }

  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

export async function saveDevice(device: string) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const devName = device;
    if (!devName) return { status: "not ok", message: "Missing Device Name" };
    if (!userId || !user) return { status: 404, message: "User not found" };

    try {
      const response = await getDbFirebase(`users/${userId}`, "shallow=true");
      const keys = response && typeof response === "object" ? Object.keys(response) : [];

      // Check if data exists
      if (keys.length > 0) {
        const datatoSave = {
          device: devName
        };
        const post = await getDbFirebase(`users/${userId}`, "", "PATCH", datatoSave);
        revalidateTag(`device-${userId}`);
        console.log("Posted");
        return { status: "ok", message: "Insert Device Success" };
      } else {
        console.log("Physiotherapist not exists");
        return { status: "not ok", message: "Cannot Insert Device" };
      }
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return { status: "not ok", message: error };
    }

  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

export async function getDevice() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return { status: 404, message: "User not found" };

    try {
      const response = await getDbFirebase(`users/${userId}/device`, "", "GET", null, {
        revalidate: false,
        tags: [`device-${userId}`]
      });
      if (!response) return { status: "not ok", message: "Device Not Found" };
      const data = {
        device: response
      };
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return { status: "not ok", message: error };
    }
  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

export async function deleteData(patientId: string, data: string) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return { status: 404, message: "User not found", ok: false };

    try {
      const response = await getDbFirebase(`data/${userId}/${patientId}/${data}`, "", "DELETE");
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