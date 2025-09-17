import { getCustomers } from "@/actions/user.action";
import Modes from "@/components/Modes";
import RightBar from "@/components/RightBar";
import SignInTab from "@/components/SignInTab";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  const user = await currentUser();
  const customers = await getCustomers(false);
  return (
    user ? (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-7">
          <Modes isClient={true} />
        </div>

        <div className="hidden lg:block lg:col-span-3 sticky top-20">
          <RightBar customers={customers} />
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <SignInTab />
      </div>
    )
  );
}