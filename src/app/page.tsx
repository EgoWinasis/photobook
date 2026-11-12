import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Login from "@/components/Login";

export default async function Home({ searchParams }: { searchParams: { error?: string } }) {
  const session = await getSession();
  if (session) redirect("/memories");
  return <Login hasError={searchParams.error === "1"} />;
}