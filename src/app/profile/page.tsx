import { notFound } from "next/navigation";
import ProfilePageClient from "./ProfilePageClient";
import { getProfileByUsername } from "@/actions/profile.action";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  "use server"; // ensure it's a server function
  const user = await getProfileByUsername();
  if (!user) {
    return {
      title: "Profile not found",
      description: "This profile does not exist.",
    };
  }

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

async function ProfilePageServer() {
  const user = await getProfileByUsername();
  console.log("user is : ", user);
  if (!user) notFound();

  return (
    <ProfilePageClient
      user={user}
    />
  );
}
export default ProfilePageServer;