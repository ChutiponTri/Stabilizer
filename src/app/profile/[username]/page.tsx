import { notFound } from "next/navigation";
import ProfilePageClient from "./ProfilePageClient";
import { getProfileByUsername } from "@/actions/profile.action";

export async function generateMetadata({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

async function ProfilePageServer({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);
  console.log("user is : ", user);
  if (!user) notFound();

  return (
    <ProfilePageClient
      user={user}
    />
  );
}
export default ProfilePageServer;