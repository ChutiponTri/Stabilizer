"use server";

export async function getDbFirebase(path:string, query:string="", method:string="GET", payload:any=null) {
  try {
    const queryString = query ? `?${query}` : "";
    const db = process.env.DB_ADDRESS;
    if (!db) throw new Error("DB_ADDRESS not Found");
    const url = `${db}/${path}.json${queryString}`;

    const options: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" },
    };

    if (method !== "GET" && method !== "HEAD" && payload !== null) {
        options.body = JSON.stringify(payload);
    }
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const data = await response.json(); // Convert response to JSON

    return data; // Return JSON data
  } catch (error) {
    console.error("Error fetching data:", error);
    return null; // Handle errors gracefully
  }
}