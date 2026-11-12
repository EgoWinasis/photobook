
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Photobook from "../../components/Photobook";

export const dynamic = "force-dynamic";

export default async function MemoriesPage() {
  const session = await getSession();

  if (!session?.username) {
    redirect("/");
  }

  return <Photobook username={session.username} />;
}
