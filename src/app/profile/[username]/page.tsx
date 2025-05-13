
import { notFound } from "next/navigation";
import ProfilePageClient from "./ProfilePageClient";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/actions/user.action";

export async function generateMetadata({ params }: { params: { username: string } }) {
  const authUser = await currentUser();
  if (!authUser) return;
  
  const user = await getUserByClerkId(authUser.id);
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

async function ProfilePageServer({ params }: { params: { username: string } }) {
  const authUser = await currentUser();
  if (!authUser) return;
  
  const user = await getUserByClerkId(authUser.id);
  if (!user) notFound();

  return (
    <ProfilePageClient
      user={user}
    />
  );
}
export default ProfilePageServer;