import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ApiDoc() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const spec = await getApiDocs();

  return (
    <main className="w-full min-h-screen bg-white text-black self-stretch">
      <div className="w-full px-4 py-8">
        <ReactSwagger spec={spec} />
      </div>
    </main>
  );
}